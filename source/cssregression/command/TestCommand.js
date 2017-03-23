'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('../../command/BaseCommand.js').BaseCommand;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const Context = require('../../application/Context.js').Context;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration').PathesConfiguration;
const GlobalConfiguration = require('../../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const ScreenshotTask = require('../task/ScreenshotTask.js').ScreenshotTask;
const CompareTask = require('../task/CompareTask.js').CompareTask;
const BuildConfiguration = require('../../model/configuration/BuildConfiguration.js').BuildConfiguration;
const WriteFilesTask = require('../../task/WriteFilesTask.js').WriteFilesTask;
const co = require('co');


/**
 * @memberOf command
 */
class TestCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context, options)
    {
        super(context);

        this._name = 'cssregression';
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'cssregression/TestCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'cssregression/TestCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Provides css regression testing',
            actions:
            [
                {
                    name: 'reference',
                    options: [],
                    description: 'Create the reference or baseline images used to detect changes'
                },
                {
                    name: 'test',
                    options: [],
                    description: 'Create new images and compares them to the reference or baseline images to detect changes'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    reference(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.cssregression.reference');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const path = pathesConfiguration.sites;
            const options =
            {
                writePath: path,
                screenshotSuffix: 'reference'
            };
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            yield scope.context.di.create(ScreenshotTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, options);
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    test(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.cssregression.test');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const path = pathesConfiguration.sites;
            const options =
            {
                writePath: path,
                screenshotSuffix: 'test',
                compareReferenceSuffix: 'reference',
                compareTestSuffix: 'test',
                compareDiffSuffix: 'diff'
            };
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            /*
            yield scope.context.di.create(ScreenshotTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, options);
            */
            yield scope.context.di.create(CompareTask, mapping)
                .run(buildConfiguration, options);
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        switch (parameters.action)
        {
            case 'test':
                return this.test();
                break;

            default:
                return this.reference();
        }
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TestCommand = TestCommand;
