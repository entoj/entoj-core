"use strict";

/**
 * Requirements
 */
let Server = require(SOURCE_ROOT + '/server/Server.js').Server;
let SitesRoute = require(SOURCE_ROOT + '/server/routes/SitesRoute.js').SitesRoute;
let CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
let request = require('supertest');
let compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(SitesRoute.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = new CliLogger('', { muted: true });
        fixtures.server = new Server(fixtures.cliLogger);
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
            let testee = new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration,
                fixtures.urlsConfiguration, fixtures.buildConfiguration);
            expect(testee.className).to.be.equal('server.routes/SitesRoute');
        });
    });


    describe('client', function()
    {
        it('should have access to configured static file types', function(done)
        {
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration));
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/modules/m001-gallery/js/m001-gallery.js')
                    .expect(200)
                    .expect('Content-Type', /javascript/, done);
            });
        });

        it('should have no access to unconfigured static file types', function(done)
        {
            let options =
            {
                staticFileExtensions: []
            };
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration, options));
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/modules/m001-gallery/js/m001-gallery.js')
                    .expect(404, done);
            });
        });

        it('should have access to template files', function(done)
        {
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration));
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/modules/m001-gallery/examples/default.j2')
                    .expect(200)
                    .expect(/<div class="m001-gallery/i)
                    .expect('Content-Type', /html/, done);
            });
        });

        it('should have access to extended template files', function(done)
        {
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration));
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/extended/modules/m001-gallery/examples/default.j2')
                    .expect(200)
                    .expect(/<div class="m001-gallery/i)
                    .expect('Content-Type', /html/, done);
            });
        });

        it('should allow to configure a custom root path for specific file types', function(done)
        {
            let options =
            {
                staticFileExtensions: [],
                staticRoutes:
                [
                    {
                        fileExtensions: ['.js'],
                        rootPath: '${sites}/default/modules/m001-gallery/js',
                        rootUrl: '*'
                    }
                ]
            };
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration, options));
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/m001-gallery.js')
                    .expect(200)
                    .expect('Content-Type', /javascript/, done);
            });
        });
    });
});
