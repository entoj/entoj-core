'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const CompileSassTask = require('../task/CompileSassTask.js').CompileSassTask;
const PostprocessCssTask = require('../task/PostprocessCssTask.js').PostprocessCssTask;
const WriteFilesTask = require('../task/WriteFilesTask.js').WriteFilesTask;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const ModelSynchronizer = require('../watch/ModelSynchronizer.js').ModelSynchronizer;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const Context = require('../application/Context.js').Context;
const co = require('co');


/**
 * @memberOf command
 */
class SassCommand extends BaseCommand
{
    /**
     */
    constructor(context)
    {
        super(context);

        // Assign options
        this._name = ['sass'];
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
        return 'command/SassCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Compiles and optimizes css files',
            actions:
            [
                {
                    name: 'compile [query]',
                    description: 'Compiles all scss files',
                    options:
                    [
                        {
                            name: 'query',
                            type: 'optional',
                            defaultValue: '*',
                            description: 'Compiles scss for the given site'
                        }
                    ]
                },
                {
                    name: 'watch',
                    description: 'Watches for changes and compiles scss files when necessary'
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
            const logger = scope.createLogger('command.sass.compile');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const path = yield pathesConfiguration.resolveCache('/css');
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            yield scope.context.di.create(CompileSassTask, mapping)
                .pipe(scope.context.di.create(PostprocessCssTask, mapping))
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, { path: path });
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise}
     */
    watch(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.sass.watch');
            const modelSynchronizer = scope.context.di.create(ModelSynchronizer);
            yield scope.compile(parameters);
            yield modelSynchronizer.start();
            modelSynchronizer.signals.invalidated.add((synchronizer, invalidations) =>
            {
                if (invalidations.extensions.indexOf('.scss') > -1)
                {
                    logger.info('Detected change in <Sass Files>');
                    scope.compile(parameters);
                }
            });
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        if (parameters.action === 'watch')
        {
            return this.watch(parameters);
        }
        return this.compile(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.SassCommand = SassCommand;
