'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseParser = require('./BaseParser.js').BaseParser;
const nunjucks = require('nunjucks');
const unique = require('lodash.uniq');
const TextNode = require('./node/TextNode.js').TextNode;
const SetNode = require('./node/SetNode.js').SetNode;
const IfNode = require('./node/IfNode.js').IfNode;
const ForNode = require('./node/ForNode.js').ForNode;
const VariableNode = require('./node/VariableNode.js').VariableNode;
const ParameterNode = require('./node/ParameterNode.js').ParameterNode;
const ParametersNode = require('./node/ParametersNode.js').ParametersNode;
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
const YieldNode = require('./node/YieldNode.js').YieldNode;
const ComplexVariableNode = require('./node/ComplexVariableNode.js').ComplexVariableNode;


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

                /* istanbul ignore next */
                default:
                    this.logger.error('parseVariable: Not Implemented', type, JSON.stringify(node, null, 4));
            }
            return result;
        };

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
                result = new FilterNode(node.name.value, new ParametersNode(), parse(node.args.children[0]));
                if (node.args.children.length > 1)
                {
                    for (let i = 1; i < node.args.children.length; i++)
                    {
                        result.parameters.children.push(new ParameterNode(undefined, this.parseExpression(node.args.children[i])));
                    }
                }
            }
            else
            {
                result = this.parseNode(node);
            }
            return result;
        };

        return parse(node);
    }


    /**
     *
     */
    parseParameters(node)
    {
        const parse = (node, parameters) =>
        {
            const type = Object.getPrototypeOf(node).typename;
            const result = parameters ? parameters : new ParametersNode();
            switch(type)
            {
                case 'NodeList':
                case 'KeywordArgs':
                    for (const child of node.children)
                    {
                        Array.prototype.push.apply(result.children, parse(child, result));
                    }
                    break;

                case 'Pair':
                    if (node.key.value !== 'caller')
                    {
                        result.children.push(new ParameterNode(node.key.value, this.parseExpression(node.value, 'parameter')));
                    }
                    break;

                case 'Symbol':
                    result.children.push(new ParameterNode(node.value));
                    break;

                /* istanbul ignore next */
                default:
                    this.logger.error('parseParameters: Not Implemented', type, JSON.stringify(node, null, 4));
            }
            return result;
        };

        return parse(node);
    }


    /**
     *
     */
    parseYield(node)
    {
        let result = false;
        const parse = (node) =>
        {
            const type = Object.getPrototypeOf(node).typename;
            switch(type)
            {
                case 'NodeList':
                case 'KeywordArgs':
                    for (const child of node.children)
                    {
                        parse(child);
                    }
                    break;

                case 'Pair':
                    if (node.key.value === 'caller' && node.value.body)
                    {
                        result = [this.parseNode(node.value.body)];
                    }
                    break;
            }
        };

        parse(node);
        return result;
    }


    /**
     *
     */
    parseComplexVariable(node)
    {
        const parse = (node, result) =>
        {
            const type = Object.getPrototypeOf(node).typename;
            switch(type)
            {
                case 'NodeList':
                case 'Dict':
                    result = {};
                    for (const child of node.children)
                    {
                        parse(child, result);
                    }
                    return result;
                    break;

                case 'Array':
                    result = [];
                    for (const child of node.children)
                    {
                        result.push(parse(child));
                    }
                    return result;
                    break;

                case 'Literal':
                    return node.value;
                    break;

                case 'Pair':
                    if (result)
                    {
                        result[node.key.value] = parse(node.value);
                    }
                    else
                    {
                        return parse(node.value);
                    }
                    break;

                /* istanbul ignore next */
                default:
                    this.logger.error('parseComplexVariable: Not Implemented', type, JSON.stringify(node, null, 4));
            }
            return undefined;
        };
        return new ComplexVariableNode(parse(node));
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
                    result.push(this.parseFilter(node));
                    break;

                /* istanbul ignore next */
                default:
                    this.logger.error('parseCondition: Not Implemented', type, JSON.stringify(node, null, 4));
            }

            return result;
        };

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

                case 'Symbol':
                case 'LookupVal':
                    result.push(this.parseVariable(node));
                    break;

                case 'Dict':
                case 'Array':
                    result.push(this.parseComplexVariable(node));
                    break;

                case 'Filter':
                    result.push(this.parseFilter(node));
                    break;

                /* istanbul ignore next */
                default:
                    this.logger.error('parseExpression: Not Implemented', type, JSON.stringify(node, null, 4));
            }
            return result;
        };

        return new ExpressionNode(parse(node));
    }


    /**
     *
     */
    parseOutput(node)
    {
        const children = [];
        let types = [];
        for (const child of node.children)
        {
            const childNode = this.parseNode(child);
            types.push(childNode.type);
            children.push(childNode);
        }
        types = unique(types);

        // Only TextNode/CallNode(s)?
        if (types.length == 1 &&
            (['TextNode', 'CallNode', 'YieldNode'].indexOf(types[0]) > -1))
        {
            return children.length > 1 ? new NodeList(children) : children[0];
        }

        // Just add the output
        return new OutputNode(children);
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
        const elseChildren = [];
        for (const child of node.body.children)
        {
            children.push(this.parseNode(child));
        }
        if (node.else_ && node.else_.children)
        {
            for (const child of node.else_.children)
            {
                elseChildren.push(this.parseNode(child));
            }
        }
        return new IfNode(condition, children, elseChildren);
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
            children.push(this.parseNode(child));
        }
        const keyName = node.name.children ? node.name.children[0].value : false;
        const valueName = node.name.children ? node.name.children[1].value : node.name.value;
        return new ForNode(keyName, valueName, values, children);
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
            children.push(this.parseNode(child));
        }

        return new MacroNode(node.name.value, parameters, children);
    }


    /**
     */
    parseCall(node)
    {
        //console.log(JSON.stringify(node, null, 4));
        if (node.name.value === 'caller')
        {
            return new YieldNode();
        }
        else
        {
            const children = this.parseYield(node.args);
            const parameters = this.parseParameters(node.args);
            return new CallNode(node.name.value, parameters, children);
        }
    }


    /**
     *
     */
    parseList(node)
    {
        const children = [];
        for (const child of node.children)
        {
            children.push(this.parseNode(child));
        }

        if (children.length > 1)
        {
            return new NodeList(children);
        }
        else
        {
            return children[0];
        }
    }


    /**
     *
     */
    parseNode(node, context)
    {
        const type = Object.getPrototypeOf(node).typename;
        let result;
        switch(type)
        {
            case 'NodeList':
            case 'Root':
                result = this.parseList(node);
                break;

            case 'Output':
                result = this.parseOutput(node);
                break;

            case 'TemplateData':
                result = this.parseText(node);
                break;

            case 'Literal':
                result = new LiteralNode(node.value);
                break;

            case 'Set':
                result = this.parseSet(node);
                break;

            case 'If':
                result = this.parseIf(node);
                break;

            case 'For':
                result = this.parseFor(node);
                break;

            case 'Symbol':
            case 'LookupVal':
                result = this.parseVariable(node);
                break;

            case 'Macro':
                result = this.parseMacro(node);
                break;

            case 'FunCall':
                result = this.parseCall(node);
                break;

            case 'Filter':
                result = this.parseFilter(node);
                break;

            case 'Caller':
                // Just ignore this
                break;

            /* istanbul ignore next */
            default:
                this.logger.error('parseNode: Not Implemented', type, node);
        }

        // return a node - always
        if (!result)
        {
            result = new TextNode('');
        }
        return result;
    }


    /**
     * @inheritDoc
     */
    parse(source)
    {
        const ast = nunjucks.parser.parse(source || '');
        //console.log(JSON.stringify(ast, null, 4));
        return Promise.resolve(this.parseNode(ast));
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Parser = Parser;
