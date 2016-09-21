"use strict";

/**
 * Requirements
 */
let Server = require(SOURCE_ROOT + '/server/Server.js').Server;
let BaseRoute = require(SOURCE_ROOT + '/server/routes/BaseRoute.js').BaseRoute;
let CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
let request = require('supertest');
let sinon = require('sinon');

/**
 * Spec
 */
describe(Server.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
        fixtures.cliLogger = new CliLogger('', { muted: true });
    });

    afterEach(function(done)
    {
        if (fixtures.server)
        {
            fixtures.server.stop().then(function() { done(); });
        }
        else
        {
            done();
        }
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new Server(fixtures.cliLogger);
            expect(testee.className).to.be.equal('server/Server');
        });
    });


    describe('#start', function()
    {
        it('should start a http server on configured port', function(done)
        {
            fixtures.server = new Server(fixtures.cliLogger);
            fixtures.server.start().then(function(server)
            {
                request(server)
                      .get('/')
                      .expect(404, done);
            });
        });
    });


    describe('#addRoute', function()
    {
        it('should allow to add routes that will be registered via route#register', function()
        {
            let server = new Server(fixtures.cliLogger);
            let route = new BaseRoute(fixtures.cliLogger);
            sinon.spy(route, 'register');
            server.addRoute(route);
            expect(route.register.calledOnce).to.be.ok;
        });
    });
});
