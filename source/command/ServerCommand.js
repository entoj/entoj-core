'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Server = require('../server/Server.js').Server;
const Context = require('../application/Context.js').Context;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const ModelSynchronizer = require('../watch/ModelSynchronizer.js').ModelSynchronizer;


/**
 * @memberOf command
 */
class ServerCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context, options)
    {
        super(context);

        this._name = 'server';
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'command/ServerCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/ServerCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Provides the development server',
            actions:
            [
                {
                    name: 'start',
                    options: [],
                    description: 'Start the server'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    start(parameters)
    {
        const scope = this;
        const logger = scope.createLogger('command.server');

        // prepare routes
        const configure = logger.section('Configuring routes');
        const routes = [];
        if (Array.isArray(this._options.routes))
        {
            for (const route of this._options.routes)
            {
                const work = logger.work('Configuring route <' + route.type.className + '>');

                const type = route.type;
                const mappings = new Map();
                for (const key in route)
                {
                    if (key !== 'type')
                    {
                        mappings.set(type.className + '.' + key, route[key]);
                    }
                }
                mappings.set(CliLogger, logger);

                const routeInstance = this.context.di.create(type, mappings);
                if (!routeInstance)
                {
                    throw new Error('Could not get instance of ' + type.className);
                }
                routes.push(routeInstance);

                logger.end(work);
            }
        }
        logger.end(configure);

        // create server
        const start = logger.section('Starting server');
        try
        {
            const modelSynchronizer = this.context.di.create(ModelSynchronizer);
            const server = new Server(logger, modelSynchronizer, routes, this._options);
            this._server = server;
        }
        catch(e)
        {
            logger.error(e);
            logger.end(start, true);
        }

        // start it
        return this._server.start().then(function()
        {
            logger.end(start);
            return scope._server;
        });
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        return this.start();
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ServerCommand = ServerCommand;
