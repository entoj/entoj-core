"use strict";

/**
 * Requirements
 */
let ServerCommand = require(SOURCE_ROOT + '/command/ServerCommand.js').ServerCommand;
let BaseRoute = require(SOURCE_ROOT + '/server/routes/BaseRoute.js').BaseRoute;
let Context = require(SOURCE_ROOT + '/application/Context.js').Context;
let CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
let compact = require(FIXTURES_ROOT + '/Application/Compact.js');
let request = require('supertest');

/**
 * Spec
 */
describe(ServerCommand.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.server = false;
        fixtures.context = new Context(fixtures.configuration);
        fixtures.cliLogger = new CliLogger('', { muted: true });
        fixtures.context.di.map(CliLogger, fixtures.cliLogger, true);
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
            let testee = new ServerCommand(fixtures.context);
            expect(testee.className).to.be.equal('command/ServerCommand');
        });
    });


    xdescribe('#execute', function()
    {
        it('should create a webserver', function(cb)
        {
            let testee = new ServerCommand(fixtures.context);
            let promise = testee.execute({ command: 'server' }).then(function(server)
            {
                fixtures.server = server;
                expect(server).to.be.ok;
                cb();
            });
            return promise;
        });

        it('should allow to configure the server port via options.port', function()
        {
            let options =
            {
                port: 3200
            };
            let testee = new ServerCommand(fixtures.context, options);
            let promise = testee.execute({ command: 'server' }).then(function(server)
            {
                fixtures.server = server;
                expect(server.port).to.be.equal(options.port);
            });
            return promise;
        });


        it('should allow to configure the server routes via options.routes', function()
        {
            let options =
            {
                routes:
                [
                    {
                        type: BaseRoute
                    }
                ]
            };
            let testee = new ServerCommand(fixtures.context, options);
            let promise = testee.execute({ command: 'server' }).then(function(server)
            {
                fixtures.server = server;
                expect(server.routes).to.have.length(1);
                expect(server.routes[0]).to.be.instanceof(BaseRoute);
            });
            return promise;
        });


        it('should start a webserver', function(done)
        {
            let testee = new ServerCommand(fixtures.context);
            let promise = testee.execute({ command: 'server' }).then(function(server)
            {
                fixtures.server = server;
                request(server.express)
                      .get('/')
                      .expect(404, done);
            });
            return promise;
        });
    });
});
