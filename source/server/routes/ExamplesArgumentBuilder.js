'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const DocumentationCallable = require('../../model/documentation/DocumentationCallable.js').DocumentationCallable;
const assertParameter = require('../../utils/assert.js').assertParameter;
const co = require('co');
require('../../utils/prototypes.js');
const EOL = '\n';

/**
 * @memberOf server.routes
 */
class ExamplesArgumentBuilder extends Base
{

    /**
     * @param {CliLogger} cliLogger
     * @param {EntitiesRepository} entitiesRepository
     */
    constructor(cliLogger)
    {
        super(cliLogger.createPrefixed('routes.examplesargumentbuilder'));
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server/routes/ExamplesArgumentBuilder';
    }


    /**
     * @inheritDocs
     */
    static get cliLogger()
    {
        return this._cliLogger;
    }


    /**
     * @param {Entity} entity
     */
    buildCombinations(entity)
    {
        if (!entity)
        {
            return Promise.reject();
        }

        // Get macro
        const macroName = entity.id.asString().lodasherize();
        const callable = entity.documentation.find(item =>
        {
            return item instanceof DocumentationCallable && item.name == macroName;
        });

        // Macro parameters
        const parameterValues = [];
        for (const parameter of callable.parameters)
        {
            const parameterValue =
            {
                name: parameter.name,
                values: []
            };
            if (parameter.type.indexOf('Enumeration') > -1)
            {
                for (const value of parameter.enumeration)
                {
                    parameterValue.values.push({ value: value.name, label: value.description });
                }
                parameterValues.push(parameterValue);
            }
        }

        // Custom parameters
        if (entity.properties && entity.properties.styleguide && entity.properties.styleguide.parameters)
        {
            for (const parameterName in entity.properties.styleguide.parameters)
            {
                const parameterValue =
                {
                    name: parameterName,
                    values: []
                };
                const values = entity.properties.styleguide.parameters[parameterName];
                for (const value of values)
                {
                    parameterValue.values.push({ value: value.value, label: value.label || '' });
                }
                parameterValues.push(parameterValue);
            }
        }

        // Reorder
        if (entity.properties && entity.properties.styleguide && entity.properties.styleguide.order)
        {
            const parameterMap = {};
            for (const parameterValue of parameterValues)
            {
                parameterMap[parameterValue.name] = parameterValue;
            }

            parameterValues.length = 0;
            for (const parameterName of entity.properties.styleguide.order)
            {
                parameterValues.push(parameterMap[parameterName]);
            }
        }

        // Build all necessary parameter combinations
        const combinator = function(parametersList)
        {
            const result = [];
            const combinatorWorker = function(parametersList, depth, current)
            {
                depth = depth || 0;
                current = current || [];

                if (depth == parametersList.length)
                {
                   result.push(current);
                   return;
                }

                for (const value of parametersList[depth].values)
                {
                    const newCurrent = current.slice();
                    newCurrent.push({ name: parametersList[depth].name, value: value});
                    combinatorWorker(parametersList, depth + 1, newCurrent);
                }
            }
            combinatorWorker(parametersList);
            return result;
        }
        const combinations = combinator(parameterValues);

        return Promise.resolve(combinations);
    }



    /**
     * @param {Entity} entity
     */
    buildTree(entity)
    {
        if (!entity)
        {
            return Promise.reject();
        }

        const scope = this;
        const promise = co(function *()
        {
            // Get combinations
            const combinations = yield scope.buildCombinations(entity);

            // Build a ui tree
            const types = {};
            const nodes = [];
            const rootNode = { label: entity.id.asString(), type: 'root', children: [] };
            const levels = combinations[0].length;

            // Initial Nodes
            for (let level = 0; level < levels; level++)
            {
                const parameter = combinations[0][level];
                const node = { label: parameter.value.label + ' <small>' + parameter.name + '</small>', type: false, children: [] };
                types[parameter.name] = parameter.value.value;
                nodes[level] = node;
                if (level === 0)
                {
                    rootNode.children.push(node);
                }
                else
                {
                    nodes[level - 1].children.push(node);
                }
                if (levels > 2 && level < levels - 2)
                {
                    node.type = 'group';
                }
                else if (level === levels - 2)
                {
                    node.type = 'examples';
                }
                else
                {
                    node.type = 'example';
                }
            }

            // Build tree
            for (const combination of combinations)
            {
                // Make sure tree is correct
                for (let level = 0; level < levels; level++)
                {
                    const parameter = combination[level];
                    if (types[parameter.name] != parameter.value.value)
                    {
                        const node = { label: parameter.value.label + ' <small>' + parameter.name + '</small>', type: false, children: [] };
                        types[parameter.name] = parameter.value.value;
                        nodes[level] = node;
                        if (level == 0)
                        {
                            rootNode.children.push(node);
                        }
                        else
                        {
                            nodes[level - 1].children.push(node);
                        }

                        if (levels > 2 && level < levels - 2)
                        {
                            node.type = 'group';
                        }
                        else if (level === levels - 2)
                        {
                            node.type = 'examples';
                        }
                        else
                        {
                            node.type = 'example';
                        }
                    }
                }

                // Add combinations to last node
                const parameters = [];
                for (const parameter of combination)
                {
                    parameters.push({ name: parameter.name, value: parameter.value.value });
                }
                nodes[levels - 1].children.push(parameters);
            }

console.log(JSON.stringify(rootNode, null, 4));

            return rootNode;
        });
        return promise;
    }


    /**
     * @param {Express}
     */
    buildTemplate(entity)
    {
        if (!entity)
        {
            return Promise.reject();
        }

        const scope = this;
        const promise = co(function *()
        {
            const build = function(node, level)
            {
                let result = '';
                const indent = '    '.repeat(level);
                if (node.type === 'group')
                {
                    result+= indent + "{% call example_group(label='" + node.label + "', level=" + (level + 1) + ") %}" + EOL;
                    for (const childNode of node.children)
                    {
                        result+= build(childNode, level + 1);
                    }
                    result+= indent + "{% endcall %}" + EOL;
                }
                else if (node.type === 'examples')
                {
                    result+= indent + "{% call examples(label='" + node.label + "', level=" + (level + 1) + ") %}" + EOL;
                    for (const childNode of node.children)
                    {
                        result+= build(childNode, level + 1);
                    }
                    result+= indent + "{% endcall %}" + EOL;
                }
                else if (node.type === 'example')
                {
                    result+= indent + "{% call example(label='" + node.label + "', level=" + (level + 2) + ") %}" + EOL;
                    result+= indent + "    {{ " + entity.id.asString().lodasherize() + "(";
                    for (const param of node.children[0])
                    {
                        result+= param.name + '=';
                        if (typeof param.value == 'string')
                        {
                            result+= '\'';
                        }
                        result+= param.value;
                        if (typeof param.value == 'string')
                        {
                            result+= '\'';
                        }
                        if (node.children[0].indexOf(param) < node.children[0].length - 1)
                        {
                            result+= ', ';
                        }
                    }
                    result+= ") }}" + EOL;
                    result+= indent + "{% endcall %}" + EOL;
                }
                return result;
            }

            // Get tree
            const tree = yield scope.buildTree(entity);
            //console.log(JSON.stringify(tree, null, 4));

            // Build template
            let template = '{% extends "/base/templates/t-example" %}' + EOL;
            template+= '{% block content %}' + EOL;
            for (const childNode of tree.children)
            {
                template+= build(childNode, 0);
            }
            template+= '{% endblock %}' + EOL;
            return template;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ExamplesArgumentBuilder = ExamplesArgumentBuilder;
