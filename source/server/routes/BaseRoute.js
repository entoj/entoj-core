'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * @memberOf server.routes
 */
class BaseRoute extends Base
{

    /**
     */
    constructor(cliLogger)
    {
        super();

        // Check params
        assertParameter(this, 'cliLogger', cliLogger, true, CliLogger);

        // Assign options
        this._cliLogger = cliLogger;
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
        return 'server/routes/BaseRoute';
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
    register(express)
    {
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseRoute = BaseRoute;
