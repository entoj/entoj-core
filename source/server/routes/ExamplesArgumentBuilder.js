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


/**
 * @memberOf server.routes
 */
class ExamplesArgumentBuilder extends Base
{

    /**
     * @param {CliLogger} cliLogger
     * @param {EntitiesRepository} entitiesRepository
     * @param {object} [options]
     */
    constructor(cliLogger, options)
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
     * @param {Express}
     */
    build(entity)
    {
        //console.log(entity);
        const result = [];
        const callable = entity.documentation.find(item =>
        {
            return item instanceof DocumentationCallable && item.name == 'e005_button';
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
            else if (parameter.type.indexOf('Boolean') > -1)
            {
                parameterValue.values.push({ value: false, label: 'False' }, { value: true, label: 'True' });
                parameterValues.push(parameterValue);
            }
        }

        // Custom parameters
        if (entity.properties.examples && entity.properties.examples.parameters)
        {
            for (const parameterName in entity.properties.examples.parameters)
            {
                const parameterValue =
                {
                    name: parameterName,
                    values: []
                };
                const values = entity.properties.examples.parameters[parameterName];
                for (const value of values)
                {
                    parameterValue.values.push({ value: value.value, label: value.label || '' });
                }
                parameterValues.push(parameterValue);
            }
        }
        //console.log(JSON.stringify(parameterValues, null, 4));

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
        console.log(combinations);

        return Promise.resolve(false);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ExamplesArgumentBuilder = ExamplesArgumentBuilder;
