"use strict";

/**
 * Requirements
 */
const Server = require(SOURCE_ROOT + '/server/Server.js').Server;
const SitesRoute = require(SOURCE_ROOT + '/server/routes/SitesRoute.js').SitesRoute;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const Environment = require(SOURCE_ROOT + '/nunjucks/Environment.js').Environment;
const request = require('supertest');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');


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
        fixtures.nunjucks = new Environment(fixtures.entitiesRepository, fixtures.globalConfiguration,
            fixtures.pathesConfiguration, fixtures.buildConfiguration, []);
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
            const testee = new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration,
                fixtures.urlsConfiguration, fixtures.buildConfiguration, fixtures.nunjucks);
            expect(testee.className).to.be.equal('server.routes/SitesRoute');
        });
    });


    describe('client', function()
    {
        it('should have access to configured static file types', function(done)
        {
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration, fixtures.nunjucks));
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
            const options =
            {
                staticFileExtensions: []
            };
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration, fixtures.nunjucks, options));
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
                fixtures.buildConfiguration, fixtures.nunjucks));
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
                fixtures.buildConfiguration, fixtures.nunjucks));
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/extended/modules/m001-gallery/examples/default.j2')
                    .expect(200)
                    .expect(/<div class="m001-gallery/i)
                    .expect('Content-Type', /html/, done);
            });
        });

        it('should allow to use environment specific template code', function(done)
        {
            fixtures.buildConfiguration.environment = 'development';
            fixtures.server.addRoute(new SitesRoute(fixtures.cliLogger, fixtures.entitiesRepository,
                fixtures.globalConfiguration, fixtures.pathesConfiguration, fixtures.urlsConfiguration,
                fixtures.buildConfiguration, fixtures.nunjucks));
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/common/macros/environment.j2')
                    .expect(200)
                    .expect(/All-Development/i)
                    .expect('Content-Type', /html/, done);
            });
        });

        it('should allow to configure a custom root path for specific file types', function(done)
        {
            const options =
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
                fixtures.buildConfiguration, fixtures.nunjucks, options));
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
