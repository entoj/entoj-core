'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const co = require('co');


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
            this._build = require(opts.task)(context, options);
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
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.release.build');
            const section = logger.section('release.build');
            yield scope._build(parameters);
            logger.end(section);
        });
        return promise;
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
