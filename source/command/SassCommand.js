'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const gulp = require('gulp');
const sass = require('../gulp/task/sass.js');
const utils = require('./utils.js');


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
                    name: 'compile',
                    description: 'Compiles all scss files',
                    options:
                    [
                        {
                            name: 'query',
                            type: 'optional',
                            defaultValue: 'all',
                            description: 'Compiles scss for the given site'
                        },
                        {
                            name: 'environment',
                            value: 'env',
                            type: 'named',
                            defaultValue: 'development',
                            description: 'Use the build settings from the given environment'
                        }
                    ]
                },
                {
                    name: 'watch',
                    description: 'Watches for changes and compiles all scss files when necessary'
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
        const logger = this.createLogger('command.sass.compile');
        const query = parameters._[2] || '*';
        const section = logger.section('sass.compile');
        const promise = utils.runTask(sass.compile, query)
            .then(() => logger.end(section));
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    watch(parameters)
    {
        const scope = this;
        return new Promise(function(resolve, reject)
        {
            const logger = scope.createLogger('command.sass.watch');

            // Run gulp task
            const section = logger.section('sass.watch');
            gulp.parallel([sass.watchTask])(function(error)
            {
                logger.end(section, !!error);
                resolve();
            });
        });
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
