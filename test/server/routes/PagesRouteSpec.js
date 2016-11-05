"use strict";

/**
 * Requirements
 */
const Server = require(SOURCE_ROOT + '/server/Server.js').Server;
const PagesRoute = require(SOURCE_ROOT + '/server/routes/PagesRoute.js').PagesRoute;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const request = require('supertest');
const documentation = require(FIXTURES_ROOT + '/Server/Documentation.js');

/**
 * Spec
 */
describe(PagesRoute.className, function()
{
    beforeEach(function()
    {
        fixtures = documentation.createFixture();
        fixtures.cliLogger = new CliLogger('', { muted: true });
        fixtures.server = new Server(fixtures.cliLogger);
        fixtures.addRoute = function(routes, options)
        {
            const opts = Object.assign({}, fixtures.options, options || {});
            fixtures.route = new PagesRoute(
                fixtures.cliLogger,
                fixtures.sitesRepository,
                fixtures.categoriesRepository,
                fixtures.entitiesRepository,
                fixtures.globalConfiguration,
                fixtures.urlsConfiguration,
                fixtures.pathesConfiguration,
                fixtures.buildConfiguration,
                fixtures.nunjucks,
                routes,
                opts);
            fixtures.server.addRoute(fixtures.route);
        }
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
            const testee = new PagesRoute(fixtures.cliLogger,
                fixtures.sitesRepository,
                fixtures.categoriesRepository,
                fixtures.entitiesRepository,
                fixtures.globalConfiguration,
                fixtures.urlsConfiguration,
                fixtures.pathesConfiguration,
                fixtures.buildConfiguration,
                fixtures.nunjucks);
            expect(testee.className).to.be.equal('server.routes/PagesRoute');
        });
    });


    describe('client', function()
    {
        it('should have access to configured routes with the configured template', function(done)
        {
            fixtures.addRoute([{ url: '/', template: 'homepage.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/')
                    .expect(200, /^Homepage/m, done);
            });
        });

        it('should have access to the location object', function(done)
        {
            fixtures.addRoute([{ url: '/', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/')
                    .expect(200, /^Url:\/:/m)
                    .expect(200, /^Site:---:/m)
                    .expect(200, /^Category:---:/m)
                    .expect(200, /^Entity:---:/m, done);
            });
        });

        it('should have access to the current site via location', function(done)
        {
            fixtures.addRoute([{ url: '/:site', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default')
                    .expect(200, /^Url:\/default:/m)
                    .expect(200, /^Site:Default:/m)
                    .expect(200, /^Category:---:/m)
                    .expect(200, /^Entity:---:/m, done);
            });
        });

        it('should receive 404 when site is uknown', function(done)
        {
            fixtures.addRoute([{ url: '/:site', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/foo')
                    .expect(404, done);
            });
        });

        it('should have access to the current entity category via location', function(done)
        {
            fixtures.addRoute([{ url: '/:site/:entityCategory', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/elements')
                    .expect(200, /^Url:\/default\/elements:/m)
                    .expect(200, /^Site:Default:/m)
                    .expect(200, /^Category:Element:/m)
                    .expect(200, /^Entity:---:/m, done);
            });
        });

        it('should receive 404 when entity category is uknown', function(done)
        {
            fixtures.addRoute([{ url: '/:site/:entityCategory', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/foo')
                    .expect(404, done);
            });
        });

        it('should have access to the current entity via location', function(done)
        {
            fixtures.addRoute([{ url: '/:site/:entityCategory/:entityId', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/elements/m001-gallery')
                    .expect(200, /^Url:\/default\/elements\/m001-gallery:/m)
                    .expect(200, /^Site:Default:/m)
                    .expect(200, /^Category:Element:/m)
                    .expect(200, /^Entity:gallery:/m, done);
            });
        });

        it('should have access to the current extended entity via location', function(done)
        {
            fixtures.addRoute([{ url: '/:site/:entityCategory/:entityId', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/extended/elements/m001-gallery')
                    .expect(200, /^Url:\/extended\/elements\/m001-gallery:/m)
                    .expect(200, /^Site:Extended:/m)
                    .expect(200, /^Category:Element:/m)
                    .expect(200, /^Entity:gallery:/m, done);
            });
        });

        it('should receive 404 when entity is uknown', function(done)
        {
            fixtures.addRoute([{ url: '/:site/:entityCategory/:entityId', template: 'location.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/default/elements/foo')
                    .expect(404, done);
            });
        });

        it('should have access to templates & categories', function(done)
        {
            fixtures.addRoute([{ url: '/', template: 'model.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/')
                    .expect(200, /^Sites:Default,Extended,/m)
                    .expect(200, /^Categories:Element,Module,/m, done);
            });
        });

        it('should have access to included macros', function(done)
        {
            fixtures.addRoute([{ url: '/', template: 'macro-test.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/')
                    .expect(200, /^__test__/m, done);
            });
        });

        it('should have access to static files under the configured base url', function(done)
        {
            fixtures.addRoute([], { staticRoute: '/internal' });
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/internal/js/application.js')
                    .expect('Content-Type', /javascript/)
                    .expect(200, /^Application/m, done);
            });
        });

        it('should allow to switch to static rendering via ?static', function(done)
        {
            fixtures.addRoute([{ url: '/', template: 'macro-test.j2' }]);
            fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/?static&foo=bar')
                    .then(function()
                    {
                        expect(fixtures.route.nunjucks.isStatic).to.be.ok;
                        done();
                    });
            });
        });
    });
});
