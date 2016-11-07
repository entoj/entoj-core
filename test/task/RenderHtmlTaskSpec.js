"use strict";

/**
 * Requirements
 */
const RenderHtmlTask = require(SOURCE_ROOT + '/task/RenderHtmlTask.js').RenderHtmlTask;
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const UrlsConfiguration = require(SOURCE_ROOT + '/model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const Environment = require(SOURCE_ROOT + '/nunjucks/Environment.js').Environment;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const sinon = require('sinon');
const PATH_SEPERATOR = require('path').sep;


/**
 * Spec
 */
describe(RenderHtmlTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(RenderHtmlTask, 'task/RenderHtmlTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.nunjucks);
        parameters.unshift(fixtures.urlsConfiguration);
        parameters.unshift(fixtures.pathesConfiguration);
        parameters.unshift(fixtures.globalRepository);
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     */
    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(RenderHtmlTask, parameters);
    };


    /**
     * RenderHtmlTask Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = fixtures.context.di.create(CliLogger);
        fixtures.cliLogger.muted = true;
        fixtures.globalRepository = fixtures.context.di.create(GlobalRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.urlsConfiguration = fixtures.context.di.create(UrlsConfiguration);
        fixtures.nunjucks = fixtures.context.di.create(Environment);
    });


    describe('#renderEntity()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.renderEntity();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should yield a rendered html VinylFile', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/modules/m001-gallery');
                const file = yield testee.renderEntity(entities[0]);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<div class="m001-gallery  ">');
            });
            return promise;
        });

        it('should allow to render macros', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/modules/m001-gallery');
                const settings =
                {
                    macro: 'm001_gallery_page'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<div class="m001-gallery-page  ">');
            });
            return promise;
        });

        it('should allow to configure macro parameters for rendering', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/modules/m001-gallery');
                const settings =
                {
                    parameters:
                    {
                        type: 'foo'
                    }
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<div class="m001-gallery foo ">');
            });
            return promise;
        });

        it('should allow to render extended macros', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('extended/modules/m001-gallery');
                const settings =
                {
                    macro: 'm001_gallery_page'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<div class="m001-gallery-page  ">');
            });
            return promise;
        });

        it('should allow to render pages', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/pages/p001-home');
                const settings =
                {
                    type: 'page'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<body class="t001-default p001-home">');
            });
            return promise;
        });

        it('should allow to render extended pages', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('extended/pages/p001-home');
                const settings =
                {
                    type: 'page'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<body class="t001-default p001-home">');
            });
            return promise;
        });

        it('should allow to render templates', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/templates/t001-default');
                const settings =
                {
                    type: 'template'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<body class="t001-default ">');
            });
            return promise;
        });

        it('should allow to render extended templates', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('extended/templates/t001-default');
                const settings =
                {
                    type: 'template'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.contain('<body class="t001-default ">');
            });
            return promise;
        });

        it('should auto generate a filename based on the entity path', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/modules/m001-gallery');
                const file = yield testee.renderEntity(entities[0]);
                expect(file.path).to.be.equal(pathes.normalizePathSeparators('base/modules/m001-gallery/m001-gallery.html'));
            });
            return promise;
        });

        it('should allow to specify a complete filename via settings', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/modules/m001-gallery');
                const settings =
                {
                    filename: 'foo/bars.html'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file.path).to.be.equal(pathes.normalizePathSeperators('foo/bars.html'));
            });
            return promise;
        });

        it('should allow to specify a partial filename via settings', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/modules/m001-gallery');
                const settings =
                {
                    filename: 'bars'
                };
                const file = yield testee.renderEntity(entities[0], settings);
                expect(file.path).to.be.equal(pathes.normalizePathSeperators('base/modules/m001-gallery/bars.html'));
            });
            return promise;
        });
    });


    describe('#renderEntities()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.renderEntities();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should yield a array of transformed VinylFiles', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const files = yield testee.renderEntities();
                expect(files).to.be.instanceof(Array);
                for (const file of files)
                {
                    expect(file).to.be.instanceof(VinylFile);
                    expect(file.contents.toString()).to.match(/<div|<body/);
                }
            });
            return promise;
        });
    });


    describe('#stream()', function()
    {
        it('should stream all compiled html files', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const data = yield baseTaskSpec.readStream(testee.stream());
                for (const file of data)
                {
                    expect(file.path).to.be.oneOf(
                        [
                            pathes.normalizePathSeperators('base/modules/m001-gallery/m001-gallery.html'),
                            pathes.normalizePathSeperators('extended/modules/m001-gallery/m001-gallery.html'),
                            pathes.normalizePathSeperators('base/pages/p001-home/p001-home.html'),
                            pathes.normalizePathSeperators('extended/pages/p001-home/p001-home.html'),
                            pathes.normalizePathSeperators('base/templates/t001-default/t001-default.html'),
                            pathes.normalizePathSeperators('extended/templates/t001-default/t001-default.html')
                        ]);
                }
            });
            return promise;
        });

        it('should allow to configure the file path', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const data = yield baseTaskSpec.readStream(testee.stream(undefined, undefined, { filepathTemplate: 'foo' }));
                for (const file of data)
                {
                    expect(file.path).to.be.oneOf(
                        [
                            pathes.normalizePathSeperators('foo/m001-gallery.html'),
                            pathes.normalizePathSeperators('foo/p001-home.html'),
                            pathes.normalizePathSeperators('foo/t001-default.html')
                        ]);
                }
            });
            return promise;
        });

        it('should allow to remove the file path', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const data = yield baseTaskSpec.readStream(testee.stream(undefined, undefined, { filepathTemplate: '' }));
                for (const file of data)
                {
                    expect(file.path).to.be.oneOf(
                        [
                            pathes.normalizePathSeperators('m001-gallery.html'),
                            pathes.normalizePathSeperators('p001-home.html'),
                            pathes.normalizePathSeperators('t001-default.html')
                        ]);
                }
            });
            return promise;
        });
    });
});
