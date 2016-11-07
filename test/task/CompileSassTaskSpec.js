"use strict";

/**
 * Requirements
 */
const CompileSassTask = require(SOURCE_ROOT + '/task/CompileSassTask.js').CompileSassTask;
const FilesRepository = require(SOURCE_ROOT + '/model/file/FilesRepository.js').FilesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const sinon = require('sinon');
const normalize = pathes.normalizePathSeperators;



/**
 * Spec
 */
describe(CompileSassTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(CompileSassTask, 'task/CompileSassTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.pathesConfiguration);
        parameters.unshift(fixtures.sitesRepository);
        parameters.unshift(fixtures.filesRepository);
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
        return create(CompileSassTask, parameters);
    };


    /**
     * SassTask Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = fixtures.context.di.create(CliLogger);
        fixtures.cliLogger.muted = true;
        fixtures.filesRepository = fixtures.context.di.create(FilesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/SassTask');
        fs.emptyDirSync(fixtures.path);
    });


    describe('#generateFiles()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.generateFiles();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to an array of vinyl files', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const files = yield testee.generateFiles();
                expect(files).to.be.instanceof(Array);
                expect(files).to.have.length.above(0);
                expect(files[0]).to.be.instanceof(VinylFile);
            });
            return promise;
        });

        it('should generate a file for each group of each configured site', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const files = yield testee.generateFiles();
                // Sites base & extended
                // Groups common & core
                expect(files).to.be.instanceof(Array);
                expect(files).to.have.length(4);
                expect(files.find(item => item.path == normalize('base/css/common.scss'))).to.be.ok;
                expect(files.find(item => item.path == normalize('base/css/core.scss'))).to.be.ok;
                expect(files.find(item => item.path == normalize('extended/css/common.scss'))).to.be.ok;
                expect(files.find(item => item.path == normalize('extended/css/core.scss'))).to.be.ok;
            });
            return promise;
        });

        it('should allow to use a query to pick source specific items for generation', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const files = yield testee.generateFiles(undefined, { query: 'base' });
                // Sites base
                // Groups common & core
                expect(files).to.be.instanceof(Array);
                expect(files).to.have.length(2);
                expect(files.find(item => item.path == normalize('base/css/common.scss'))).to.be.ok;
                expect(files.find(item => item.path == normalize('base/css/core.scss'))).to.be.ok;
            });
            return promise;
        });

        it('should generate files consisting of relative includes of all found sources', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const files = yield testee.generateFiles();
                const source = files.find(item => item.path == normalize('base/css/core.scss'));
                expect(source.contents.toString()).to.contain('@import \'base/modules/m001-gallery/sass/m001-gallery.scss\';');
            });
            return promise;
        });

        it('should handle extended entities by including the extended source', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const files = yield testee.generateFiles();
                const source = files.find(item => item.path == normalize('extended/css/core.scss'));
                expect(source.contents.toString()).to.contain('@import \'base/modules/m001-gallery/sass/m001-gallery.scss\';');
                expect(source.contents.toString()).to.contain('@import \'extended/modules/m001-gallery/sass/m001-gallery.scss\';');
            });
            return promise;
        });
    });


    describe('#compileFile()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.compileFile();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to an vinyl files', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const sourceFile = new VinylFile(
                {
                    path: 'test.scss',
                    contents: new Buffer('')
                });
                const file = yield testee.compileFile(sourceFile);
                expect(file).to.be.instanceof(VinylFile);
            });
            return promise;
        });

        it('should compile the contents of the given file to css', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const sourceFile = new VinylFile(
                {
                    path: 'test.scss',
                    contents: new Buffer('$spacer: 10px; .spacer { width: $spacer; }')
                });
                const file = yield testee.compileFile(sourceFile);
                expect(file.contents.toString()).to.be.contain('width: 10px;');
            });
            return promise;
        });

        it('should change the file path to a .css extension', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const sourceFile = new VinylFile(
                {
                    path: 'test.scss',
                    contents: new Buffer('')
                });
                const file = yield testee.compileFile(sourceFile);
                expect(file.path).to.endWith('.css');
            });
            return promise;
        });

        it('should throw an error when compilation fails', function(cb)
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const sourceFile = new VinylFile(
                {
                    path: 'test.scss',
                    contents: new Buffer('{% set model =  %}')
                });
                const file = yield testee.compileFile(sourceFile);
            }).catch((e) =>
            {
                expect(e).to.be.instanceof(Error);
                cb();
            })
        });
    });


    describe('#compileFiles()', function()
    {
        it('should return a stream', function(cb)
        {
            const testee = createTestee();
            testee.compileFiles()
                .on('finish', cb);
        });

        it('should stream a vinylfile for each group and site', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const data = yield baseTaskSpec.readStream(testee.compileFiles());
                for (const file of data)
                {
                    expect(file.contents.toString()).to.not.contain('@import \'');
                    expect(file.path).to.be.oneOf([normalize('base/css/common.css'), normalize('base/css/core.css'),
                                                   normalize('extended/css/common.css'), normalize('extended/css/core.css')]);
                }
            });
            return promise;
        });

        it('should allow to customize file pathes', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const data = yield baseTaskSpec.readStream(testee.compileFiles(undefined, { filenameTemplate: '${site.name.urlify()}/${group}.scss' }));
                for (const file of data)
                {
                    expect(file.contents.toString()).to.not.contain('@import \'');
                    expect(file.path).to.be.oneOf([normalize('base/common.css'), normalize('base/core.css'),
                                                   normalize('extended/common.css'), normalize('extended/core.css')]);
                }
            });
            return promise;
        });
    });


    describe('#stream()', function()
    {
        it('should stream all compiled css files', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const data = yield baseTaskSpec.readStream(testee.stream());
                for (const file of data)
                {
                    expect(file.path).to.be.oneOf([normalize('base/css/common.css'), normalize('base/css/core.css'),
                                                   normalize('extended/css/common.css'), normalize('extended/css/core.css')]);
                }
            });
            return promise;
        });
    });
});
