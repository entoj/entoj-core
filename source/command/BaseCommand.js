'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const Context = require('../application/Context.js').Context;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const BaseMap = require('../base/BaseMap.js').BaseMap;
const assertParameter = require('../utils/assert.js').assertParameter;


/**
 * @memberOf command
 */
class BaseCommand extends Base
{
    /**
     * @param {Context} context
     */
    constructor(context)
    {
        super();

        //Check params
        assertParameter(this, 'context', context, true, Context);

        // Assign options
        this._name = '';
        this._context = context;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/BaseCommand';
    }


    /**
     * @inheritDocs
     */
    get context()
    {
        return this._context;
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        return { name: this._name };
    }


    /**
     * @param {object} parameters
     */
    createLogger(prefix)
    {
        return this.context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix': prefix }));
    }



    /**
     * @param {object} parameters
     */
    doExecute(parameters)
    {
        return Promise.resolve(true);
    }


    /**
     * @param {object} parameters
     * @returns {Promise}
     */
    execute(parameters)
    {
        if (parameters && parameters.command == this._name)
        {
            return this.doExecute(parameters);
        }
        return Promise.resolve(false);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseCommand = BaseCommand;
