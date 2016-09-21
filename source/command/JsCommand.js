'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const js = require('../gulp/task/js.js');
const utils = require('./utils.js');


/**
 * @memberOf command
 */
class JsCommand extends BaseCommand
{
    /**
     */
    constructor(context)
    {
        super(context);

        // Assign options
        this._name = 'js';
        this._pathesConfiguration = context.di.create(PathesConfiguration);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, PathesConfiguration] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/JsCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Compiles and optimizes js files',
            actions:
            [
                {
                    name: 'compile',
                    description: 'Compiles all js files for the given site(s)'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise}
     */
    compile(parameters)
    {
        const logger = this.createLogger('command.js.compile');
        const query = parameters._[0] || '*';
        const section = logger.section('js.compile');
        const promise = utils.runTask(js.compile, query)
            .then(() => logger.end(section));
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise}
     */
    doExecute(parameters)
    {
        return this.compile(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JsCommand = JsCommand;
