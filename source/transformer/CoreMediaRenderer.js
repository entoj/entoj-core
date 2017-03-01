'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRenderer = require('./BaseRenderer.js').BaseRenderer;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const ViewModelRepository = require('../model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const assertParameter = require('../utils/assert.js').assertParameter;
const uppercaseFirst = require('../utils/string.js').uppercaseFirst;
const isPlainObject = require('../utils/objects.js').isPlainObject;
const synchronize = require('../utils/synchronize.js').execute;
const htmlspecialchars = require('htmlspecialchars');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const EOL = '\n';


/**
 * CoreMedia template renderer
 */
class CoreMediaRenderer extends BaseRenderer
{
    /**
     * @ignore
     */
    constructor(globalRepository, globalConfiguration, pathesConfiguration)
    {
        super();

        // Check params
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._globalRepository = globalRepository;
        this._globalConfiguration = globalConfiguration;
        this._pathesConfiguration = pathesConfiguration;
        this._svgs = false;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [GlobalRepository, GlobalConfiguration, PathesConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/CoreMediaRenderer';
    }


    /**
     * Prepares rendering parameters
     */
    prepareParameters(parameters)
    {
        const result = parameters || {};
        result.useSelf = result.useSelf || {};
        result.useSelf.macros = result.useSelf.macros || [];
        result.useSelf.values = result.useSelf.values || [];
        result.replaceSet = result.replaceSet || {};
        result.replaceVariable = result.replaceVariable || {};
        return result;
    }


    /**
     *
     */
    getSvgs()
    {
        if (!this._svgs)
        {
            const files = glob.sync(this._pathesConfiguration.sites + '/base/global/assets/icons/*.svg');
            this._svgs =
            {
                viewBoxes: {},
                urls: {}
            };
            for (const file of files)
            {
                const name = path.basename(file, '.svg');

                // Url
                this._svgs.urls[name] = '/static/tkde/assets/base/icons/' + name + '.svg#icon';

                // Viewbox
                this._svgs.viewBoxes[name] = '0 0 0 0';
                const icon = fs.readFileSync(file, { encoding: 'utf8' });
                const viewbox = icon.match(/viewBox="([^"]*)"/i);
                if (viewbox && viewbox[1])
                {
                    this._svgs.viewBoxes[name] = viewbox[1];
                }
            }
        }
        return this._svgs;
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
            result+= '\'' + node.value.replace(/\"/g, '\\"') + '\'';
        }
        else
        {
            result+= node.value;
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
            result+= ' view="tkArticle"';
            result+= ' />';
        }
        // Check date filter
        else if (node.children.length &&
            node.children[0].type === 'FilterNode' &&
            node.children[0].name === 'date')
        {
            let key = '';
            const filter = node.children[0];

            result+= '<fmt:formatDate';
            result+= ' value="${ ' + this.renderExpression(filter.value, parameters) + '.time }"'; // Will be Gregorian calender so we require .time to format the date
            result+= ' type="date" pattern="dd.MM.yyyy"';
            result+= ' />';

        }
        // Check hyphenate filter
        else if (node.children.length &&
            node.children[0].type === 'FilterNode' &&
            node.children[0].name === 'hyphenate')
        {
            let key = '';
            const filter = node.children[0];

            result+= '${ tk:hyphenate(' + this.renderExpression(filter.value, parameters) + ') }';

        }
        // Check metdata filter
        else if (node.children.length &&
            node.children[0].type === 'FilterNode' &&
            node.children[0].name === 'metadata')
        {
            const filter = node.children[0];
            const key = filter.value.value;
            if (key === 'entity')
            {
                result+= '<cm:metadata value="${ self.content }" />';
            }
            else
            {
                result+= '<cm:metadata value="properties.' + key + '" />';
            }
        }
        // Check default filter
        else if (node.children.length &&
            node.children[0].type === 'FilterNode' &&
            node.children[0].name === 'default')
        {
            const filter = node.children[0];
            const value = this.renderExpression(filter.value, parameters);
            const defaultValue = filter.parameters.children.length ? this.renderExpression(filter.parameters.children[0].value, parameters) : "''";
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
            this.logger.warn(this.className + '::renderExpression node is undefined');
            return '';
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

            case 'ArrayNode':
                const items = [];
                for (const child of node.children)
                {
                    items.push(this.renderExpression(child, parameters));
                }
                result+= '[' + items.join(', ') + ']';
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

            case 'IfNode':
                result+= '(' + this.renderCondition(node.condition, parameters) + ') ';
                result+= '? (' + this.renderExpression(node.children, parameters) + ') ';
                result+= ': (' + this.renderExpression(node.elseChildren, parameters) + ')';
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

        // Handle model
        for (const parameter of node.parameters.children)
        {
            if (parameter.value && parameter.name === 'model')
            {
                // Render type
                let type = 'CMObject';
                if (parameters && parameters.macros && parameters.macros[node.name])
                {
                    type = parameters.macros[node.name].type;
                }
                result+= '<!-- <%--@elvariable id="self" type="' + type + '"--%> -->' + EOL;
                result+= '<!-- <%--@elvariable id="model" type="' + type + '"--%> -->' + EOL;

                // Render default value
                result+= '<c:if test="${ empty ' + parameter.name + ' }">' + EOL;
                result+= '  <c:set var="model" value="${ self }" />' + EOL;
                result+= '</c:if>' + EOL;
            }
        }

        // Handle default parameters
        const macro = synchronize(this._globalRepository, 'resolveMacro', ['base', node.name]);
        const macroParameters = {};
        if (macro)
        {
            for (const parameter of macro.parameters)
            {
                if (parameter.name !== 'model' && typeof parameter.defaultValue !== 'undefined')
                {
                    let parameterValue = parameter.defaultValue;
                    if (parameterValue !== 'false' && parameterValue !== false)
                    {
                        macroParameters[parameter.name] = '${ ' + parameterValue + ' }';
                    }
                }
            }
        }

        // Get actual parameters
        for (const parameter of node.parameters.children)
        {
            if (parameter.value && parameter.name !== 'model')
            {
                let parameterValue = this.renderExpression(parameter.value, parameters);
                if (parameterValue !== 'false' && parameterValue !== false)
                {
                    macroParameters[parameter.name] = '${ ' + parameterValue + ' }';
                }
            }
        }

        // Render default parameters
        for (const parameterName of Object.keys(macroParameters))
        {
            const parameterValue = macroParameters[parameterName];
            if (parameterValue)
            result+= '<c:if test="${ empty ' + parameterName + ' }">' + EOL;
            result+= '  <c:set var="' + parameterName + '" value="' + parameterValue + '" />' + EOL;
            result+= '</c:if>' + EOL;
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
     * Renders a complex variable
     */
    renderComplexVariable(name, data, parameters)
    {
        let result = '';
        result+= '<jsp:useBean id="' + name + '" class="java.util.TreeMap" />';
        const render = (name, data) =>
        {
            let result = '';
            for (const key in data)
            {
                if (isPlainObject(data[key]))
                {
                    result+= '<jsp:useBean id="' + name + '_' + key + '" class="java.util.TreeMap" />';
                    result+= render(name + '_' + key, data[key]);
                    result+= '<c:set target="${ ' + name + ' }" property="' + key + '" value="${ ' + name + '_' + key + ' }" />';
                }
                else
                {
                    result+= '<c:set target="${ ' + name + ' }" property="' + key + '" value="' + htmlspecialchars(data[key] || '') + '" />';
                }
            }
            return result;
        }
        result+= render(name, data);
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
            node.value &&
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
            node.value &&
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
            node.value &&
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
        // handle settings
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'settings')
        {
            const filter = node.value.children[0];
            const key = filter.value.value;
            result+= '<c:set var="' + this.getVariable(node.variable, parameters) + '"';
            result+= ' value="${ bp:setting(' + this.renderExpression(filter.parameters.children[0].value, parameters) + ', \'' + key + '\') }" />';
        }
        // handle breakpoints
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'mediaQuery')
        {
            const filter = node.value.children[0];
            const mediaQueries = this._globalConfiguration.get('mediaQueries');
            const mediaQueriesVariable = 'globalMediaQueries'
            result+= '<jsp:useBean id="' + mediaQueriesVariable + '" class="java.util.TreeMap" />';
            for (const mediaQueryName in mediaQueries)
            {
                result+= '<c:set target="${ ' + mediaQueriesVariable + ' }" property="' + mediaQueryName + '" value="' + mediaQueries[mediaQueryName] + '" />';
            }
            result+= '<c:set var="' + this.getVariable(node.variable, parameters) + '" value="${ ' + mediaQueriesVariable + '[' + this.getVariable(filter.value, parameters) + '] }" />';
        }
        // handle imageUrl
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'imageUrl')
        {
            const filter = node.value.children[0];
            const args = [];
            for (const param of filter.parameters.children)
            {
                args.push(this.renderExpression(param.value, parameters));
            }
            result+= '<tk:image target="${ self }" var="' + this.getVariable(node.variable, parameters) + '"';
            if (args.length)
            {
                result+= ' aspect="${ ' + args[0] + ' }"';
                if (args.length >= 2)
                {
                    result+= ' width="${ ' + args[1] + ' }"';
                }
                if (args.length >= 3)
                {
                    result+= ' height="${ ' + args[2] + ' }"';
                }
            }
            result+= ' />';
        }
        // handle navigationClass
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'navigationClass')
        {
            const filter = node.value.children[0];
            const args = [];
            for (const param of filter.parameters.children)
            {
                args.push(this.renderExpression(param.value, parameters));
            }
            result+= '<c:set var="' + this.getVariable(node.variable, parameters) + '" ';
            result+= 'value="${ bp:cssClassAppendNavigationActive(\'\', ' + args.join(', ') + ', ' + this.getVariable(filter.value, parameters) + ', model.navigationPathList) }" />';
        }
        // handle moduleClasses
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'moduleClasses')
        {
            const filter = node.value.children[0];
            const moduleClass = this.renderExpression(filter.parameters.children[0].value, parameters);
            result+= '<c:set var="' + this.getVariable(node.variable, parameters) + '" ';
            result+= 'value="${ ' + moduleClass + ' }';
            if (filter.value.type === 'VariableNode')
            {
                const variable = this.getVariable(filter.value, parameters);
                result+= ' ${ not empty ' + variable + ' ? ' + moduleClass + '.concat(\'--\').concat(' + variable + ') : \'\' }';
            }
            if (filter.value.type === 'ArrayNode')
            {
                for (const child of filter.value.children)
                {
                    const variable = this.renderExpression(child, parameters);
                    result+= ' ${ not empty ' + variable + ' ? ' + moduleClass + '.concat(\'--\').concat(' + variable + ') : \'\' }';
                }
            }
            result+= '" />';
        }
        // handle objectType
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'objectType')
        {
            const filter = node.value.children[0];
            const args = [];
            for (const param of filter.parameters.children)
            {
                args.push(this.renderExpression(param.value, parameters));
            }
            result+= '<c:set var="' + this.getVariable(node.variable, parameters) + '" ';
            result+= 'value="${ ' + this.getVariable(filter.value, parameters) + '[\'class\'].simpleName }" />';
        }
        // skip load filter
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'load')
        {
        }
        // handle complex variables
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'ComplexVariableNode')
        {
            const data = node.value.children[0].value;
            if (Array.isArray(data))
            {
                // See if it is a breakpoint config
                if (typeof data[0].breakpoint === 'string')
                {
                    let index = 0;
                    const variableName = this.getVariable(node.variable, parameters);
                    result+= '<jsp:useBean id="' + variableName + '" class="de.tk.web.coremedia.website.cae.base.picture.Breakpoints"/>';
                    for (const breakpoint of data)
                    {
                        index++;
                        const breakpointVariableName = variableName + '_' + index;
                        result+= '<jsp:useBean id="' + breakpointVariableName + '" class="de.tk.web.coremedia.website.cae.base.picture.Breakpoint"/>';
                        if (breakpoint.breakpoint)
                        {
                            result+= '<c:set target="${ ' + breakpointVariableName + ' }" property="name" value="' + breakpoint.breakpoint + '"/>';
                        }
                        result+= '<c:set target="${ ' + breakpointVariableName + ' }" property="aspect" value="' + breakpoint.aspect + '"/>';
                        if (breakpoint.width)
                        {
                            result+= '<c:set target="${ ' + breakpointVariableName + ' }" property="width" value="' + breakpoint.width + '"/>';
                        }
                        if (breakpoint.height)
                        {
                            result+= '<c:set target="${ ' + breakpointVariableName + ' }" property="height" value="' + breakpoint.height + '"/>';
                        }
                        result+= '<c:set target="${ ' + variableName + ' }" property="' + index + '" value="${ ' + breakpointVariableName + ' }"/>';
                    }
                }
                // No
                else
                {
                    this.logger.error('renderSet - Error rendering array');
                }
            }
            else
            {
                result+= this.renderComplexVariable(this.getVariable(node.variable, parameters), data, parameters);
            }
        }
        // handle svg
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'svgUrl')
        {
            const filter = node.value.children[0];
            const variable = this.getVariable(node.variable, parameters);
            const name = this.renderExpression(filter.value, parameters);
            result+= '<c:set var="' + variable + '" value="${ pageContext.request.contextPath }/static/tkde/assets/base/icons/${ ' + name + ' }.svg#icon" />';
        }
        else if (node.type === 'SetNode' &&
            node.value &&
            node.value.type === 'ExpressionNode' &&
            node.value.children.length &&
            node.value.children[0].type === 'FilterNode' &&
            node.value.children[0].name === 'svgViewBox')
        {
            const filter = node.value.children[0];
            const variable = this.getVariable(node.variable, parameters);
            const name = this.renderExpression(filter.value, parameters);
            result+= '<c:choose>';
            for (const svgName in this.getSvgs().viewBoxes)
            {
                result+= '<c:when test="${' + name + ' == \'' + svgName + '\'}"><c:set var="' + variable + '" value="' + this.getSvgs().viewBoxes[svgName] + '" /></c:when>';
            }
            result+= '</c:choose>';
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
            let value = this.renderExpression(node.value, parameters);
            if (value === 'false')
            {
                value = 'null';
            }
            result+= '<c:set';
            result+= ' var="' + this.getVariable(node.variable, parameters) + '"';
            result+= ' value="${ ' + value + ' }"';
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

        // Create iteration var
        const variableName = node.keyName ? node.keyName + 'And' + uppercaseFirst(node.valueName) : node.valueName;

        // Create iteration
        result+= '<c:forEach var="';
        result+= variableName;
        result+= '" items="${ ';
        result+= this.renderExpression(node.value, parameters).trim();
        result+= ' }"';
        result+= ' varStatus="loop">';

        // Add local vars
        if (node.keyName)
        {
            result+= '<c:set';
            result+= ' var="' + node.keyName + '"';
            result+= ' value="${ ' + variableName + '.key }"';
            result+= ' />';
            result+= '<c:set';
            result+= ' var="' + node.valueName + '"';
            result+= ' value="${ ' + variableName + '.value }"';
            result+= ' />';
        }

        // Render children
        for (const child of node.children)
        {
            result+= this.renderNode(child, parameters);
        }

        // End Iteration
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
        const value = (modelParameter && modelParameter.value) ? this.renderExpression(modelParameter.value, parameters) : '';
        let result = '';

        // Default view
        let view = (node.name.endsWith('_dispatcher')) ? node.name.substr(0, node.name.length - 11).replace('_', '-') : node.name;
        if (parameters &&
            parameters.views &&
            parameters.views[node.name])
        {
            view = parameters.views[node.name];
        }

        // Override view?
        if (parameters &&
            parameters.settings &&
            parameters.settings.views &&
            parameters.settings.views[node.name])
        {
            view = parameters.settings.views[node.name];
        }

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

        // Get defaults
        const macro = synchronize(this._globalRepository, 'resolveMacro', ['base', node.name]);
        const macroParameters = {};
        if (macro)
        {
            for (const parameter of macro.parameters)
            {
                if (parameter.name !== 'model')
                {
                    let parameterValue = parameter.defaultValue;
                    if (parameterValue === 'false')
                    {
                        parameterValue = 'null';
                    }
                    macroParameters[parameter.name] = '${ ' + parameterValue + ' }';
                }
            }
        }

        // Get actual parameters
        for (const parameter of node.parameters.children)
        {
            if (parameter !== modelParameter)
            {
                macroParameters[parameter.name] = '${ ' + this.renderExpression(parameter.value, parameters) + ' }';
            }
        }

        // Render parameters
        if (modelParameter && modelParameter.value)
        {
            result+= '<cm:param name="' + modelParameter.name + '" value="${ ' + this.renderExpression(modelParameter.value, parameters) + ' }"/>';
        }
        for (const parameterName in macroParameters)
        {
            result+= '<cm:param name="' + parameterName + '" value="' + macroParameters[parameterName] + '"/>';
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
     *
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
        source+= '<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>' + EOL;
        source+= '<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>' + EOL;
        source+= '<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>' + EOL;
        source+= '<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>' + EOL;
        source+= '<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>' + EOL;
        source+= '<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>' + EOL;
        source+= this.renderNode(node, params);
        return Promise.resolve(source);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaRenderer = CoreMediaRenderer;
