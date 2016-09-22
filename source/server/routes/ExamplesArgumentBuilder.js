'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
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
        const result = [];
        console.log(entity);
        return Promise.resolve(false);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ExamplesArgumentBuilder = ExamplesArgumentBuilder;
