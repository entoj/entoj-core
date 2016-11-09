'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const Context = require('../application/Context.js').Context;
const RenderHtmlTask = require('../task/RenderHtmlTask.js').RenderHtmlTask;
const BeautifyHtmlTask = require('../task/BeautifyHtmlTask.js').BeautifyHtmlTask;
const WriteFilesTask = require('../task/WriteFilesTask.js').WriteFilesTask;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const co = require('co');


/**
 * @memberOf command
 */
class HtmlCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context)
    {
        super(context);

        // Assign options
        this._name = 'html';
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
        return 'command/HtmlCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Genrates HTML files for modules',
            actions:
            [
                {
                    name: 'compile',
                    description: 'Compiles all html files for the given query'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    compile(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.html.compile');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const path = yield pathesConfiguration.resolveCache('/html');
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            yield scope.context.di.create(RenderHtmlTask, mapping)
                .pipe(scope.context.di.create(BeautifyHtmlTask, mapping))
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, { writePath: path });
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
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
module.exports.HtmlCommand = HtmlCommand;
