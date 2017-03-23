'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const BaseRoute = require('./routes/BaseRoute.js').BaseRoute;
const ModelSynchronizer = require('../watch/ModelSynchronizer.js').ModelSynchronizer;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const express = require('express');
const fs = require('fs');
const http = require('http');
const spdy = require('spdy');
const basicAuth = require('basic-auth-connect');
const compression = require('compression');
const bodyParser = require('body-parser');


/**
 * @memberOf server
 */
class Server extends Base
{
    /**
     * @param {CliLogger} cliLogger
     * @param {ModelSynchronizer} modelSynchronizer
     * @param {object} [routes]
     * @param {object} [options]
     */
    constructor(cliLogger, modelSynchronizer, routes, options)
    {
        super();

        // Check params
        assertParameter(this, 'cliLogger', cliLogger, true, CliLogger);

        // Add initial values
        const opts = options || {};
        this._cliLogger = cliLogger;
        this._modelSynchronizer = modelSynchronizer;
        this._http2 = opts.http2 || false;
        this._port = opts.port || 3000;
        this._express = express();
        this._routes = [];
        this._sslKey = opts.sslKey || (__dirname + '/localhost.key');
        this._sslCert = opts.sslCert || (__dirname + '/localhost.crt');

        // Add settings
        this._express.use(compression());
        this._express.use(bodyParser.json());

        // Add basic auth
        if (opts.authentication === true)
        {
            const credentials = opts.credentials || { username: 'entoj', password: 'entoj' };
            this._express.use(basicAuth(credentials.username, credentials.password));
        }

        // Add routes
        if (Array.isArray(routes))
        {
            for (const route of routes)
            {
                this.addRoute(route);
            }
        }
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, ModelSynchronizer, 'server/Server.routes', 'server/Server.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server/Server';
    }


    /**
     * @let {String}
     */
    get port()
    {
        return this._port;
    }


    /**
     * @let {Express}
     */
    get express()
    {
        return this._express;
    }


    /**
     * @let {Array}
     */
    get routes()
    {
        return this._routes;
    }


    /**
     * @param {server.routes.BaseRoute}
     */
    addRoute(route)
    {
        // Check params
        assertParameter(this, 'route', route, true, BaseRoute);

        // Register
        this._routes.push(route);
        route.register(this.express);
    }


    /**
     * @returns {Promise.<Express>}
     */
    start()
    {
        const scope = this;
        return new Promise(function(resolve, reject)
        {
            if (scope._http2)
            {
                const options =
                {
                    key: fs.readFileSync(scope._sslKey),
                    cert: fs.readFileSync(scope._sslCert)
                };
                const work = scope._cliLogger.work('Starting <http/2> server at <https://localhost:' + scope.port + '>');
                scope._server = spdy.createServer(options, scope.express).listen(scope.port);
                scope._cliLogger.end(work);
            }
            else
            {
                const work = scope._cliLogger.info('Starting <http> server at <http://localhost:' + scope.port + '>');
                scope._server = http.createServer(scope.express).listen(scope.port);
                scope._cliLogger.end(work);
            }

            if (scope._modelSynchronizer)
            {
                const startSyncer = scope._cliLogger.info('Starting <Synchronizer>');
                scope._modelSynchronizer.start()
                    .then(function()
                    {
                        scope._cliLogger.end(startSyncer);
                        resolve(scope._server);
                    });
            }
            else
            {
                resolve(scope._server);
            }
        });
    }


    /**
     * @returns {Promise.<Bool>}
     */
    stop()
    {
        const scope = this;
        return new Promise(function(resolve, reject)
        {
            if (scope._server)
            {
                scope._cliLogger.info('Server: Stopping');
                scope._server.close(function()
                {
                    resolve(scope._server);
                });
            }
            else
            {
                resolve(false);
            }
        });
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Server = Server;
