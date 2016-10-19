'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRenderer = require('./BaseRenderer.js').BaseRenderer;
const EOL = '\n';


/**
 * CoreMedia template renderer
 */
class CoreMediaRenderer extends BaseRenderer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/CoreMediaRenderer';
    }


    /**
     * Renders a variable
     */
    getVariable(node)
    {
        let result = '';
        if (node.fields && node.fields.length > 0)
        {
            for (const field of node.fields)
            {
                if (typeof field == 'number')
                {
                    result = result.substring(0, result.length - 1);
                    result+= '[' + field + '].';
                }
                else
                {
                    result+= field + '.';
                }
            }
            result = result.substring(0, result.length - 1);
        }
        return result;
    }


    /**
     *
     */
    getLiteral(node)
    {
        let result = '';
        if (typeof node.value == 'string')
        {
            result+= '\'';
        }
        result+= node.value;
        if (typeof node.value == 'string')
        {
            result+= '\'';
        }
        return result;
    }


    /**
     *
     */
    renderOutput(node)
    {
        let result = '${ ';
        const render = (node) =>
        {
            let result = '';
            switch(node.type)
            {
                case 'FilterNode':
                    result+= this.renderExpression(node);
                    break;

                case 'NodeList':
                case 'OutputNode':
                    for (const child of node.children)
                    {
                        result+= render(child);
                    }
                    break;

                case 'LiteralNode':
                    result+= this.getLiteral(node);
                    break;

                case 'VariableNode':
                    result+= this.getVariable(node);
                    break;

                case 'YieldNode':
                    result+= this.renderYield(node);
                    break;

                default:
                    this.logger.error('renderOutput: Not Implemented', node);
            }

            return result;
        }
        result+= render(node);
        result+= ' }';
        return result;
    }



    /**
     *
     */
    renderVariable(node)
    {
        return '${ ' + this.getVariable(node) + ' }';
    }


    /**
     *
     */
    renderCondition(node)
    {
        if (!node)
        {
            throw new Error(this.className + '::renderCondition node is undefined');
        }

        let result = '';
        switch(node.type)
        {
            case 'FilterNode':
                if (node.name == "empty")
                {
                    result+= "empty ";
                    result+= this.renderExpression(node.value);
                }
                else if (node.name == "notempty")
                {
                    result+= " not empty ";
                    result+= this.renderExpression(node.value);
                }
                else
                {
                    if (node.value.type === 'FilterNode')
                    {
                        result+= '(';
                    }
                    result+= this.renderCondition(node.value);
                    if (node.value.type === 'FilterNode')
                    {
                        result+= ')';
                    }
                    result+= '.' + node.name + '()';
                }
                break;

            case 'VariableNode':
                result+= node.fields.join('.');
                break;

            case 'NodeList':
            case 'ConditionNode':
                for (const child of node.children)
                {
                    result+= this.renderCondition(child);
                }
                break;

            case 'LiteralNode':
                result+= this.getLiteral(node);
                break;

            case 'OperandNode':
            case 'BooleanOperandNode':
                result = result.trim() + ' ' + node.value + ' ';
                break;

            case 'GroupNode':
                result+= '(';
                for (const groupNode of node.children)
                {
                    result+= this.renderCondition(groupNode);
                }
                result+= ')';
                break;

            default:
                this.logger.error('renderCondition: Not Implemented', node);
        }
        return result;
    }


    /**
     *
     */
    renderExpression(node)
    {
        if (!node)
        {
            throw new Error(this.className + '::renderExpression node is undefined');
        }

        let result = '';
        const type = Array.isArray(node) ? 'Array' : node.type;
        switch(type)
        {
            case 'NodeList':
                for (const child of node.children)
                {
                    result+= this.renderExpression(child);
                }
                break;

            case 'Array':
                for (const child of node)
                {
                    result+= this.renderExpression(child);
                }
                break;

            case 'FilterNode':
                if (node.name == "empty")
                {
                    result+= "empty ";
                    result+= this.renderExpression(node.value);
                }
                else if (node.name == "notempty")
                {
                    result+= " not empty ";
                    result+= this.renderExpression(node.value);
                }
                else
                {
                    result+= this.renderExpression(node.value);
                    result+= '.' + node.name + '(';
                    const parameters = [];
                    if (node.parameters)
                    {
                        for (const parameter of node.parameters.children)
                        {
                            parameters.push(this.renderExpression(parameter.value));
                        }
                    }
                    result+= parameters.join(', ');
                    result+= ')';
                }
                break;

            case 'ExpressionNode':
                for (const child of node.children)
                {
                    result+= this.renderExpression(child);
                }
                break;

            case 'LiteralNode':
                result+= this.getLiteral(node);
                break;

            case 'OperandNode':
            case 'BooleanOperandNode':
                result = result.trim() + ' ' + node.value + ' ';
                break;

            case 'VariableNode':
                result+= this.getVariable(node);
                break;

            default:
                this.logger.error('renderExpression: Not Implemented', type, node);
        }
        return result;
    }


    /**
     *
     */
    renderMacro(node)
    {
        let result = '';
        result+= '<!-- Macro ' + node.name + ' -->' + EOL;

        // Handle default values
        for (const parameter of node.parameters.children)
        {
            if (parameter.value && parameter.name !== 'model')
            {
                result+= '<c:if test="${ empty ' + parameter.name + ' }">' + EOL;
                result+= '  <c:set var="' + parameter.name + '" value="${ ' + this.renderExpression(parameter.value) + ' }" />' + EOL;
                result+= '</c:if>' + EOL;
            }
        }

        // Render contents
        for (const child of node.children)
        {
            result+= this.renderNode(child);
        }

        result+= '<!-- /Macro ' + node.name + ' -->' + EOL;
        return result;
    }


    /**
     *
     */
    renderSet(node)
    {
        let result = '';

        // handle cm:link
        if (node.type === 'SetNode' &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'link')
        {
            result+= '<cm:link';
            result+= ' var="' + this.getVariable(node.variable) + '"';
            result+= ' target="${ ' + this.renderExpression(node.value.children[0].value) + ' }"';
            result+= ' />';
        }
        // handle markup fields
        else if (node.type === 'SetNode' &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'markup')
        {
            result+= '<c:set';
            result+= ' var="' + this.getVariable(node.variable) + '"';
            result+= '>';

            result+= '<cm:include';
            result+= ' self="${ ' + this.renderExpression(node.value.children[0].value) + ' }"';
            result+= ' />';

            result+= '</c:set>';
        }
        // handle standard set
        else if (node.variable.type == 'VariableNode')
        {
            result+= '<c:set';
            result+= ' var="' + this.getVariable(node.variable) + '"';
            result+= ' value="${ ' + this.renderExpression(node.value) + ' }"';
            result+= ' />';
        }
        return result;
    }


    /**
     *
     */
    renderIf(node)
    {
        let result = '';
        result+= '<c:if test="${ ';
        result+= this.renderCondition(node.condition).trim();
        result+= ' }">';
        for (const child of node.children)
        {
            result+= this.renderNode(child);
        }
        result+= '</c:if>';
        return result;
    }


    /**
     *
     */
    renderFor(node)
    {
        let result = '';
        result+= '<c:forEach var="';
        result+= node.name;
        result+= '" items="${ ';
        result+= this.renderExpression(node.value).trim();
        result+= ' }">';
        for (const child of node.children)
        {
            result+= this.renderNode(child);
        }
        result+= '</c:forEach>';
        return result;
    }


    /**
     *
     */
    renderCall(node)
    {
        /*
        <cm:include self="${list}" view="linklist">
            <cm:param name="key" value="${}"/>
        </cm:include>
        */

        let result = '';
        result+= '<cm:include ';

        // Determine self
        const modelParameter = node.parameters.children.find((parameter) =>
        {
            return parameter.name == 'model';
        });
        if (modelParameter && modelParameter.value)
        {
            result+= 'self="${ ' + this.renderExpression(modelParameter.value) + ' }" ';
        }

        // Determine view
        if (!node.name.endsWith('_dispatcher'))
        {
            result+= 'view="' + node.name + '"';
        }
        result+= '>';

        // Determine parameters
        for (const parameter of node.parameters.children)
        {
            if (parameter !== modelParameter)
            {
                result+= '<cm:param name="' + parameter.name + '" value="${ ' + this.renderExpression(parameter.value) + ' }"/>';
            }
        }

        // Close include
        result+= '</cm:include>';

        return result;
    }


    /**
     *
     */
    renderYield(node)
    {
        return '<cm:include self="${ self }"/>';
    }


    /**
     *
     */
    renderNode(node)
    {
        let result = '';
        switch(node.type)
        {
            case 'RootNode':
            case 'NodeList':
                for (const child of node.children)
                {
                    result+= this.renderNode(child);
                }
                break;

            case 'OutputNode':
                result+= this.renderOutput(node);
                break;

            case 'TextNode':
            case 'LiteralNode':
                result+= node.value;
                break;

            case 'IfNode':
                result+= this.renderIf(node);
                break;

            case 'SetNode':
                result+= this.renderSet(node);
                break;

            case 'MacroNode':
                result+= this.renderMacro(node);
                break;

            case 'VariableNode':
                result+= this.renderVariable(node);
                break;

            case 'ForNode':
                result+= this.renderFor(node);
                break;

            case 'CallNode':
                result+= this.renderCall(node);
                break;

            case 'YieldNode':
                result+= this.renderYield(node);
                break;

            default:
                this.logger.error('renderNode: Not Implemented', node);
        }

        return result;
    }


    /**
     */
    render(node)
    {
        if (!node)
        {
            return Promise.resolve('');
        }
        return Promise.resolve(this.renderNode(node));
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaRenderer = CoreMediaRenderer;
