'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const TransformCoreMediaTask = require('../task/TransformCoreMediaTask.js').TransformCoreMediaTask;
const BeautifyHtmlTask = require('../task/BeautifyHtmlTask.js').BeautifyHtmlTask;
const WriteFilesTask = require('../task/WriteFilesTask.js').WriteFilesTask;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const co = require('co');


/**
 * @memberOf command
 */
class CoreMediaCommand extends BaseCommand
{
    /**
     */
    constructor(context, options)
    {
        super(context);

        // Assign options
        this._name = 'coremedia';
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'command/CoreMediaCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/CoreMediaCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Generates CoreMedia template files from entities',
            actions:
            [
                {
                    name: 'compile',
                    description: 'Compiles all CoreMedia templates for the given <query>'
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
            // Prepare configs
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const path = yield pathesConfiguration.resolveCache('/coremedia');
            const options =
            {
                query: parameters && parameters._[2] || '*',
                path: path,
                flatten: scope._options.flatten || true
            };
            const buildConfiguration = scope.context.di.create(BuildConfiguration);

            // Prepare logger
            const logger = scope.createLogger('command.coremedia.compile');
            const mapping = new Map();
            mapping.set(CliLogger, logger);

            // Run tasks
            let task = scope.context.di.create(TransformCoreMediaTask, mapping);
            if (typeof scope._options.beautify == 'undefined' || scope._options.beautify === true)
            {
                task = task.pipe(scope.context.di.create(BeautifyHtmlTask, mapping));
            }
            task = task.pipe(scope.context.di.create(WriteFilesTask, mapping))
            yield task.run(buildConfiguration, options);
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
module.exports.CoreMediaCommand = CoreMediaCommand;
