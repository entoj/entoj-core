'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const ModelSynchronizer = require('../watch/ModelSynchronizer.js').ModelSynchronizer;


/**
 * @memberOf command
 */
class BrowserSyncCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context, options)
    {
        super(context);

        this._name = 'server';
        this._options = options || {};
        this._browsersync = require('browser-sync').create();
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
        return 'command/BrowserSyncCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Adds browsersync to the development server',
            actions:
            [
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
        const logger = this.createLogger('command.browsersync');
        const section = logger.section('Starting BrowserSync');

        // create server
        const workServer = logger.work('Starting proxy');
        try
        {
            const port = this._options.port || 3000;
            this._options.port = port - 1;
            let serverAddress = ((this._options.http2 || false) ? 'https' : 'http') + '://localhost';
            serverAddress+= ':' + (this._options.port);
            logger.info('Starting proxy for ' + serverAddress);
            scope._browsersync.init(
                {
                    proxy: serverAddress,
                    port: port,
                    https: this._options.http2 || false
                });
        }
        catch(e)
        {
            logger.error(e);
        }
        logger.end(workServer);

        // Add watcher
        const workSyncer = logger.work('Adding synchronizer');
        const synchronizer = this.context.di.create(ModelSynchronizer);
        synchronizer.signals.invalidated.add(function(synchronizer, invalidations)
        {
            if (invalidations.extensions.some(ext => ['.md', '.js', '.j2'].indexOf(ext) >= 0))
            {
                logger.info('Full reload');
                scope._browsersync.reload();
            }
            if (invalidations.extensions.some(ext => ['.css'].indexOf(ext) >= 0))
            {
                logger.info('CSS reload');
                scope._browsersync.reload('*.css');
            }
        });
        synchronizer.start();
        logger.end(workSyncer);

        logger.end(section);
        return Promise.resolve(scope._browsersync);
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
module.exports.BrowserSyncCommand = BrowserSyncCommand;
