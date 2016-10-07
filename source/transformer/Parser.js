'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseParser = require('./BaseParser.js').BaseParser;
const nunjucks = require('nunjucks');
const nodes = require('nunjucks/src/nodes.js');
const TextNode = require('./node/TextNode.js').TextNode;
const SetNode = require('./node/SetNode.js').SetNode;
const IfNode = require('./node/IfNode.js').IfNode;
const ForNode = require('./node/ForNode.js').ForNode;
const VariableNode = require('./node/VariableNode.js').VariableNode;
const ParameterNode = require('./node/ParameterNode.js').ParameterNode;
const ExpressionNode = require('./node/ExpressionNode.js').ExpressionNode;
const LiteralNode = require('./node/LiteralNode.js').LiteralNode;
const OperandNode = require('./node/OperandNode.js').OperandNode;
const BooleanOperandNode = require('./node/BooleanOperandNode.js').BooleanOperandNode;
const ConditionNode = require('./node/ConditionNode.js').ConditionNode;
const GroupNode = require('./node/GroupNode.js').GroupNode;
const FilterNode = require('./node/FilterNode.js').FilterNode;
const NodeList = require('./node/NodeList.js').NodeList;
const MacroNode = require('./node/MacroNode.js').MacroNode;
const CallNode = require('./node/CallNode.js').CallNode;
const OutputNode = require('./node/OutputNode.js').OutputNode;


/**
 * Jinja Template Parser
 */
class Parser extends BaseParser
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/Parser';
    }


    /**
     *
     */
    parseText(node)
    {
        return new TextNode(node.value);
    }


    /**
     *
     */
    parseVariable(node)
    {
        //console.log(JSON.stringify(node, null, 4));
        const parse = (node) =>
        {
            const type = Object.getPrototypeOf(node).typename;
            const result = [];
            switch(type)
            {
                case 'Symbol':
                case 'Literal':
                    result.push(node.value);
                    break;

                case 'LookupVal':
                    Array.prototype.push.apply(result, parse(node.target));
                    Array.prototype.push.apply(result, parse(node.val));
                    break;

                default:
                    scope.logger.error('parseVariable: Not Implemented', type, JSON.stringify(node, null, 4));
            }
            return result;
        }

        return new VariableNode(parse(node));
    }



    /**
     *
     */
    parseFilter(node)
    {
        const parse = (node) =>
        {
            let result;
            const type = Object.getPrototypeOf(node).typename;
            if (type === 'Filter')
            {
                result = new FilterNode(node.name.value);
                result.value = parse(node.args.children[0]);
                if (node.args.children.length > 1)
                {
                    for (let i = 1; i < node.args.children.length; i++)
                    {
                        result.parameters.push(this.parseExpression(node.args.children[i]));
                    }
                }
            }
            else
            {
                result = new NodeList(this.parseNode(node));
            }
            return result;
        }
        return parseFilter(node);
    }


    /**
     *
     */
    parseParameters(node)
    {
        const parse = (node) =>
        {
            const type = Object.getPrototypeOf(node).typename;
            const result = [];
            switch(type)
            {
                case 'NodeList':
                case 'KeywordArgs':
                    for (const child of node.children)
                    {
                        Array.prototype.push.apply(result, parse(child));
                    }
                    break;

                case 'Pair':
                    if (node.key.value !== 'caller')
                    {
                        result.push(new ParameterNode([node.key.value], this.parseNode(node.value, 'parameter')));
                    }
                    break;

                case 'Symbol':
                    result.push(new ParameterNode([node.value]));
                    break;

                default:
                    this.logger.error('parseParameters: Not Implemented', type, JSON.stringify(node, null, 4));
            }
            return result;
        }

        return parse(node);
    }


    /**
     *
     */
    parseCondition(node)
    {
        const parse = (node, result) =>
        {
            const type = Object.getPrototypeOf(node).typename;
            result = result || [];
            switch(type)
            {
                case 'Group':
                    const group = new GroupNode();
                    for (const child of node.children)
                    {
                        group.children.push.apply(group.children, parse(child));
                    }
                    result.push(group);
                    break;

                case 'Literal':
                    result.push(new LiteralNode(node.value));
                    break;

                case 'LookupVal':
                    result.push(this.parseVariable(node));
                    break;

                case 'Symbol':
                    result.push(new VariableNode([node.value]));
                    break;

                case 'Compare':
                    parse(node.expr, result);
                    for (const op of node.ops)
                    {
                        parse(op, result);
                    }
                    break;

                case 'Not':
                    result.push(new BooleanOperandNode('not'));
                    parse(node.target, result);
                    break;

                case 'CompareOperand':
                    result.push(new OperandNode(node.type));
                    parse(node.expr, result);
                    break;

                case 'Or':
                    parse(node.left, result);
                    result.push(new BooleanOperandNode('or'));
                    parse(node.right, result);
                    break;

                case 'And':
                    parse(node.left, result);
                    result.push(new BooleanOperandNode('and'));
                    parse(node.right, result);
                    break;

                case 'Filter':
                    const parseFilter = (node) =>
                    {
                        let result;
                        const type = Object.getPrototypeOf(node).typename;
                        if (type === 'Filter')
                        {
                            result = new FilterNode(node.name.value);
                            result.value = parseFilter(node.args.children[0]);
                            if (node.args.children.length > 1)
                            {
                                for (let i = 1; i < node.args.children.length; i++)
                                {
                                    result.parameters.push(this.parseExpression(node.args.children[i]));
                                }
                            }
                        }
                        else
                        {
                            result = new NodeList(this.parseNode(node, 'condition'));
                        }
                        return result;
                    }
                    const filter = parseFilter(node);
                    result.push(filter);
                    break;

                default:
                    this.logger.error('parseCondition: Not Implemented', type, JSON.stringify(node, null, 4));
            }

            return result;
        }

        return new ConditionNode(parse(node));
    }


    /**
     *
     */
    parseExpression(node)
    {
        const parse = (node, result) =>
        {
            result = result || [];
            const type = Object.getPrototypeOf(node).typename;
            switch(type)
            {
                case 'Add':
                    parse(node.left, result);
                    result.push(new OperandNode('+'));
                    parse(node.right, result);
                    break;

                case 'Literal':
                    result.push(new LiteralNode(node.value));
                    break;

                case 'LookupVal':
                    result.push(this.parseVariable(node));
                    break;

                case 'Filter':
                    const parseFilter = (node) =>
                    {
                        let result;
                        const type = Object.getPrototypeOf(node).typename;
                        if (type === 'Filter')
                        {
                            result = new FilterNode(node.name.value);
                            result.value = parseFilter(node.args.children[0]);
                            if (node.args.children.length > 1)
                            {
                                for (let i = 1; i < node.args.children.length; i++)
                                {
                                    result.parameters.push(this.parseExpression(node.args.children[i]));
                                }
                            }
                        }
                        else
                        {
                            result = new NodeList(this.parseNode(node, 'expression'));
                        }
                        return result;
                    }
                    const filter = parseFilter(node);
                    result.push(filter);
                    break;

                default:
                    this.logger.error('parseExpression: Not Implemented', type, JSON.stringify(node, null, 4));
            }
            return result;
        }

        return new ExpressionNode(parse(node));
    }


    /**
     *
     */
    parseOutput(node)
    {
        return new OutputNode([this.parseVariable(node)]);
    }


    /**
     *
     */
    parseSet(node)
    {
        const variable = this.parseVariable(node.targets[0]);
        const expression = this.parseExpression(node.value);
        return new SetNode(variable, expression);
    }


    /**
     *
     */
    parseIf(node)
    {
        //console.log(JSON.stringify(node, null, 4));
        const condition = this.parseCondition(node.cond);
        const children = [];
        for (const child of node.body.children)
        {
            children.push.apply(children, this.parseNode(child));
        }
        return new IfNode(condition, children);
    }


    /**
     *
     */
    parseFor(node)
    {
        //console.log(JSON.stringify(node, null, 4));
        const values = this.parseVariable(node.arr);
        const children = [];
        for (const child of node.body.children)
        {
            children.push.apply(children, this.parseNode(child));
        }
        return new ForNode(node.name.value, values, children);
    }


    /**
     */
    parseMacro(node)
    {
        //console.log(JSON.stringify(node, null, 4));
        const children = [];
        const parameters = this.parseParameters(node.args);
        for (const child of node.body.children)
        {
            children.push.apply(children, this.parseNode(child));
        }

        return new MacroNode(node.name.value, parameters, children);
    }


    /**
     */
    parseCall(node)
    {
        //console.log(JSON.stringify(node, null, 4));
        const parameters = this.parseParameters(node.args);
        const children = [];
        if (node.body)
        {
            for (const child of node.body.children)
            {
                children.push.apply(children, this.parseNode(child));
            }
        }

        return new CallNode(node.name.value, parameters, children);
    }


    /**
     *
     */
    parseNode(node, context)
    {
        const type = Object.getPrototypeOf(node).typename;
        const result = [];
        switch(type)
        {
            case 'NodeList':
            case 'Root':
            case 'Output':
                for (const child of node.children)
                {
                    result.push.apply(result, this.parseNode(child));
                }
                break;

            case 'TemplateData':
                result.push(this.parseText(node));
                break;

            case 'Set':
                result.push(this.parseSet(node));
                break;

            case 'If':
                result.push(this.parseIf(node));
                break;

            case 'For':
                result.push(this.parseFor(node));
                break;

            case 'Symbol':
            case 'LookupVal':
                if (context)
                {
                    result.push(this.parseVariable(node));
                }
                else
                {
                    result.push(this.parseOutput(node));
                }
                break;

            case 'KeywordArgs':
                result.push(this.parseVariable(node));
                break;

            case 'Macro':
                result.push(this.parseMacro(node));
                break;

            case 'FunCall':
                result.push(this.parseCall(node));
                break;

            case 'Literal':
                result.push(new LiteralNode(node.value));
                break;

            case 'Filter':
                result.push(this.parseFilter(node));
                break;

            case 'Caller':
                // Just ignore this
                break;

            default:
                this.logger.error('parseNode: Not Implemented', type, node);
        }

        return result;
    }


    /**
     */
    parse(source)
    {
        const ast = nunjucks.parser.parse(source);
        return new NodeList(this.parseNode(ast));
    }
}


module.exports.Parser = Parser;
