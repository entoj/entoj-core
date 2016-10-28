'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const BundleJsTask = require('../task/BundleJsTask.js').BundleJsTask;
const WriteFilesTask = require('../task/WriteFilesTask.js').WriteFilesTask;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const co = require('co');


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
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.js.compile');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const path = yield pathesConfiguration.resolveCache('/js');
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            yield scope.context.di.create(BundleJsTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, { path: path });
        });
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
