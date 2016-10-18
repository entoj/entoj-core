'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const gulp = require('gulp');


/**
 * @memberOf command
 */
class ReleaseCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context, options)
    {
        super(context);

        // Assign options
        const opts = options || {};
        this._name = 'release';

        // Load task
        if (opts.task)
        {
            this._release = require(opts.task)(gulp);
        }
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'command/ReleaseCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/ReleaseCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Builds full release',
            actions:
            [
                {
                    name: 'build',
                    description: 'Builds a release that contains all necessary files'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    build(parameters)
    {
        const scope = this;
        return new Promise(function(resolve, reject)
        {
            const logger = scope.createLogger('command.release.build');

            // Run gulp task
            const section = logger.section('release.build');
            gulp.parallel(['release.build'])(function(error)
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
        return this.build(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ReleaseCommand = ReleaseCommand;
