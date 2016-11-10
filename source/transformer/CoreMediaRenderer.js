'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRenderer = require('./BaseRenderer.js').BaseRenderer;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const ViewModelRepository = require('../model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const htmlencode = require('htmlencode').htmlEncode;
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
    prepareParameters(parameters)
    {
        const result = parameters || {};
        result.useSelf = result.useSelf || {};
        result.useSelf.macros = result.useSelf.macros || [];
        result.useSelf.values = result.useSelf.values || [];
        result.replaceSet = result.replaceSet || {};
        return result;
    }


    /**
     * Renders a variable
     */
    getVariable(node, parameters)
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
    getLiteral(node, parameters)
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
    renderOutput(node, parameters)
    {
        let result = '';

        // Check translation filter
        if (node.children.length &&
            node.children[0].type === 'FilterNode' &&
            node.children[0].name === 'translate')
        {
            let key = '';
            const filter = node.children[0];
            if (filter.parameters.children.length)
            {
                key = filter.parameters.children[0].value.children[0].value;
            }
            else if (filter.value.type === 'LiteralNode')
            {
                key = filter.value.value;
            }
            result+= '<fmt:message';
            result+= ' key="' + key + '"';
            result+= ' />';
        }
        // Check markup filter
        else if (node.children.length &&
            node.children[0].type === 'FilterNode' &&
            node.children[0].name === 'markup')
        {
            let key = '';
            const filter = node.children[0];
            result+= '<cm:include';
            result+= ' self="${ ' + this.renderExpression(filter.value, parameters) + ' }"';
            result+= ' />';
        }
        // Check default filter
        else if (node.children.length &&
            node.children[0].type === 'FilterNode' &&
            node.children[0].name === 'default')
        {
            const filter = node.children[0];
            const value = this.renderExpression(filter.value, parameters);
            const defaultValue = this.renderExpression(filter.parameters.children[0].value, parameters);
            result+= '${ ';
            result+=  value + ' is empty ? ' + defaultValue + ' : ' + value;
            result+= ' }';
        }
        // Just straight output
        else
        {
            result+= '${ ';
            const render = (node) =>
            {
                let result = '';
                switch(node.type)
                {
                    case 'FilterNode':
                        result+= this.renderExpression(node, parameters);
                        break;

                    case 'NodeList':
                    case 'OutputNode':
                        for (const child of node.children)
                        {
                            result+= render(child);
                        }
                        break;

                    case 'LiteralNode':
                        result+= this.getLiteral(node, parameters);
                        break;

                    case 'VariableNode':
                        result+= this.getVariable(node, parameters);
                        break;

                    case 'YieldNode':
                        result+= this.renderYield(node, parameters);
                        break;

                    default:
                        this.logger.error('renderOutput: Not Implemented', node);
                }

                return result;
            };
            result+= render(node);
            result+= ' }';
        }
        return result;
    }


    /**
     *
     */
    renderVariable(node, parameters)
    {
        return '${ ' + this.getVariable(node, parameters) + ' }';
    }


    /**
     *
     */
    renderCondition(node, parameters)
    {
        if (!node)
        {
            throw new Error(this.className + '::renderCondition node is undefined');
        }

        let result = '';
        switch(node.type)
        {
            case 'FilterNode':
                if (node.name == 'empty')
                {
                    result+= 'empty ';
                    result+= this.renderExpression(node.value, parameters);
                }
                else if (node.name == 'notempty')
                {
                    result+= ' not empty ';
                    result+= this.renderExpression(node.value, parameters);
                }
                else
                {
                    if (node.value.type === 'FilterNode')
                    {
                        result+= '(';
                    }
                    result+= this.renderCondition(node.value, parameters);
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
                    result+= this.renderCondition(child, parameters);
                }
                break;

            case 'LiteralNode':
                result+= this.getLiteral(node, parameters);
                break;

            case 'OperandNode':
            case 'BooleanOperandNode':
                result = result.trim() + ' ' + node.value + ' ';
                break;

            case 'GroupNode':
                result+= '(';
                for (const groupNode of node.children)
                {
                    result+= this.renderCondition(groupNode, parameters);
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
    renderExpression(node, parameters)
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
                    result+= this.renderExpression(child, parameters);
                }
                break;

            case 'Array':
                for (const child of node)
                {
                    result+= this.renderExpression(child, parameters);
                }
                break;

            case 'FilterNode':
                result+= this.renderExpression(node.value, parameters);
                result+= '.' + node.name + '(';
                const filterParameters = [];
                if (node.parameters)
                {
                    for (const parameter of node.parameters.children)
                    {
                        filterParameters.push(this.renderExpression(parameter.value, parameters));
                    }
                }
                result+= filterParameters.join(', ');
                result+= ')';
                break;

            case 'ExpressionNode':
                for (const child of node.children)
                {
                    result+= this.renderExpression(child, parameters);
                }
                break;

            case 'LiteralNode':
                result+= this.getLiteral(node, parameters);
                break;

            case 'OperandNode':
            case 'BooleanOperandNode':
                result = result.trim() + ' ' + node.value + ' ';
                break;

            case 'VariableNode':
                result+= this.getVariable(node, parameters);
                break;

            default:
                this.logger.error('renderExpression: Not Implemented', type, node);
        }
        return result;
    }


    /**
     *
     */
    renderMacro(node, parameters)
    {
        let result = '';
        result+= '<!-- Macro ' + node.name + ' -->' + EOL;

        // Handle default values & model
        for (const parameter of node.parameters.children)
        {
            if (parameter.value && parameter.name !== 'model')
            {
                result+= '<c:if test="${ empty ' + parameter.name + ' }">' + EOL;
                result+= '  <c:set var="' + parameter.name + '" value="${ ' + this.renderExpression(parameter.value, parameters) + ' }" />' + EOL;
                result+= '</c:if>' + EOL;
            }
            else if (parameter.value && parameter.name === 'model')
            {
                result+= '<c:if test="${ empty ' + parameter.name + ' }">' + EOL;
                result+= '  <c:set var="model" value="${ self }" />' + EOL;
                result+= '</c:if>' + EOL;
            }
        }

        // Render contents
        for (const child of node.children)
        {
            result+= this.renderNode(child, parameters);
        }

        result+= '<!-- /Macro ' + node.name + ' -->' + EOL;
        return result;
    }


    /**
     *
     */
    renderSet(node, parameters)
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
            result+= ' var="' + this.getVariable(node.variable, parameters) + '"';
            result+= ' target="${ ' + this.renderExpression(node.value.children[0].value, parameters) + ' }"';
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
            result+= ' var="' + this.getVariable(node.variable, parameters) + '"';
            result+= '>';

            result+= '<cm:include';
            result+= ' self="${ ' + this.renderExpression(node.value.children[0].value, parameters) + ' }"';
            result+= ' />';

            result+= '</c:set>';
        }
        // handle translate
        else if (node.type === 'SetNode' &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'translate')
        {
            let key = '';
            const filter = node.value.children[0];
            if (filter.parameters.children.length)
            {
                key = filter.parameters.children[0].value.children[0].value;
            }
            else if (filter.value.type === 'LiteralNode')
            {
                key = filter.value.value;
            }
            result+= '<fmt:message';
            result+= ' var="' + this.getVariable(node.variable, parameters) + '"';
            result+= ' key="' + key + '"';
            result+= ' />';
        }
        // handle complex variables
        else if (node.type === 'SetNode' &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'DictionaryNode')
        {
            const data = JSON.stringify(node.value.children[0].value);
            result+= '<tk:loadJson modelAttribute="' + this.getVariable(node.variable, parameters) + '" jsonString=\'' + (data) + '\' />';
        }
        // handle set replacements
        else if (typeof parameters.replaceSet[this.getVariable(node.variable, parameters)] !== 'undefined')
        {
            result+= '<c:set';
            result+= ' var="' + this.getVariable(node.variable, parameters) + '"';
            result+= ' value="' + parameters.replaceSet[this.getVariable(node.variable, parameters)] + '"';
            result+= ' />';
        }
        // handle standard set
        else if (node.variable.type == 'VariableNode')
        {
            result+= '<c:set';
            result+= ' var="' + this.getVariable(node.variable, parameters) + '"';
            result+= ' value="${ ' + this.renderExpression(node.value, parameters) + ' }"';
            result+= ' />';
        }
        return result;
    }


    /**
     *
     */
    renderIf(node, parameters)
    {
        let result = '';

        // If
        if (!node.elseChildren.length)
        {
            result+= '<c:if test="${ ';
            result+= this.renderCondition(node.condition, parameters).trim();
            result+= ' }">';
            for (const child of node.children)
            {
                result+= this.renderNode(child, parameters);
            }
            result+= '</c:if>';
        }
        // If .. else
        else
        {
            result+= '<c:choose><c:when test="${ ';
            result+= this.renderCondition(node.condition, parameters).trim();
            result+= ' }">';
            for (const child of node.children)
            {
                result+= this.renderNode(child, parameters);
            }
            result+= '</c:when>';
            result+= '<c:otherwise>';
            for (const child of node.elseChildren)
            {
                result+= this.renderNode(child, parameters);
            }
            result+= '</c:otherwise></c:choose>';
        }

        return result;
    }


    /**
     *
     */
    renderFor(node, parameters)
    {
        let result = '';
        result+= '<c:forEach var="';
        result+= node.name;
        result+= '" items="${ ';
        result+= this.renderExpression(node.value, parameters).trim();
        result+= ' }">';
        for (const child of node.children)
        {
            result+= this.renderNode(child, parameters);
        }
        result+= '</c:forEach>';
        return result;
    }


    /**
     *
     */
    renderCall(node, parameters)
    {
        // Prepare
        const modelParameter = node.parameters.getParameter('model');
        const view = (node.name.endsWith('_dispatcher')) ? node.name.substr(0, node.name.length - 11) : node.name;
        const value = (modelParameter && modelParameter.value) ? this.renderExpression(modelParameter.value, parameters) : '';
        let result = '';

        // Start
        result+= '<cm:include ';

        // Determine self
        if (modelParameter &&
            modelParameter.value &&
            parameters.useSelf.macros.indexOf(view) < 0 &&
            !parameters.useSelf.values.some((regex) => value.match(regex) ))
        {
            result+= 'self="${ ' + value + ' }" ';
        }
        else
        {
            result+= 'self="${ self }" ';
        }

        // Determine view
        result+= 'view="' + view + '"';

        // End
        result+= '>';

        // Determine parameters
        if (modelParameter && modelParameter.value)
        {
            result+= '<cm:param name="' + modelParameter.name + '" value="${ ' + this.renderExpression(modelParameter.value, parameters) + ' }"/>';
        }
        for (const parameter of node.parameters.children)
        {
            if (parameter !== modelParameter)
            {
                result+= '<cm:param name="' + parameter.name + '" value="${ ' + this.renderExpression(parameter.value, parameters) + ' }"/>';
            }
        }

        // Close include
        result+= '</cm:include>';

        return result;
    }


    /**
     *
     */
    renderYield(node, parameters)
    {
        return '<cm:include self="${ self }"/>';
    }


    /**
     *
     */
    renderNode(node, parameters)
    {
        let result = '';
        switch(node.type)
        {
            case 'RootNode':
            case 'NodeList':
                for (const child of node.children)
                {
                    result+= this.renderNode(child, parameters);
                }
                break;

            case 'OutputNode':
                result+= this.renderOutput(node, parameters);
                break;

            case 'TextNode':
            case 'LiteralNode':
                result+= node.value;
                break;

            case 'IfNode':
                result+= this.renderIf(node, parameters);
                break;

            case 'SetNode':
                result+= this.renderSet(node, parameters);
                break;

            case 'MacroNode':
                result+= this.renderMacro(node, parameters);
                break;

            case 'VariableNode':
                result+= this.renderVariable(node, parameters);
                break;

            case 'ForNode':
                result+= this.renderFor(node, parameters);
                break;

            case 'CallNode':
                result+= this.renderCall(node, parameters);
                break;

            case 'YieldNode':
                result+= this.renderYield(node, parameters);
                break;

            default:
                this.logger.error('renderNode: Not Implemented', node);
        }

        return result;
    }


    /**
     */
    render(node, parameters)
    {
        if (!node)
        {
            return Promise.resolve('');
        }
        const params = this.prepareParameters(parameters);
        let source = '';
        source+= '<%@ page contentType="text/html; charset=UTF-8" session="false" %>' + EOL;
        source+= '<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>' + EOL;
        source+= this.renderNode(node, params);
        return Promise.resolve(source);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaRenderer = CoreMediaRenderer;
