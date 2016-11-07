"use strict";

/**
 * Requirements
 */
const BundleJsTask = require(SOURCE_ROOT + '/task/BundleJsTask.js').BundleJsTask;
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
const PATH_SEPERATOR = require('path').sep;


/**
 * Spec
 */
describe(BundleJsTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(BundleJsTask, 'task/BundleJsTask', prepareParameters);

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
        return create(BundleJsTask, parameters);
    };


    /**
     * BundleJsTask Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = fixtures.context.di.create(CliLogger);
        fixtures.cliLogger.muted = true;
        fixtures.filesRepository = fixtures.context.di.create(FilesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/BundleJsTask');
        fs.emptyDirSync(fixtures.path);
    });


    describe('#generateConfiguration()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.generateConfiguration();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to an array containing bundle configs for each configured site', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const bundles = yield testee.generateConfiguration();
                expect(bundles).to.be.instanceof(Array);
                expect(bundles).to.have.length(2);
            });
            return promise;
        });

        it('should generate bundle configs that contains all groups', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const bundles = yield testee.generateConfiguration();
                const baseBundle = bundles[0];
                const extendedBundle = bundles[1];
                expect(baseBundle).to.contain.key('common');
                expect(baseBundle.common.filename).to.be.equal(pathes.normalizePathSeperators('base/common.js'));
                expect(baseBundle).to.contain.key('core');
                expect(baseBundle.core.filename).to.be.equal(pathes.normalizePathSeperators('base/core.js'));
                expect(extendedBundle).to.contain.key('common');
                expect(extendedBundle.common.filename).to.be.equal(pathes.normalizePathSeperators('extended/common.js'));
                expect(extendedBundle).to.contain.key('extended');
                expect(extendedBundle.extended.filename).to.be.equal(pathes.normalizePathSeperators('extended/extended.js'));
            });
            return promise;
        });

        it('should allow to customize bundle file pathes', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const bundles = yield testee.generateConfiguration(undefined, { filenameTemplate: '${group.urlify()}.js'});
                const baseBundle = bundles[0];
                const extendedBundle = bundles[1];
                expect(baseBundle.common.filename).to.be.equal(pathes.normalizePathSeperators('common.js'));
                expect(baseBundle.core.filename).to.be.equal(pathes.normalizePathSeperators('core.js'));
                expect(extendedBundle.common.filename).to.be.equal(pathes.normalizePathSeperators('common.js'));
                expect(extendedBundle.extended.filename).to.be.equal(pathes.normalizePathSeperators('extended.js'));
            });
            return promise;
        });

        it('should generate bundle configs that contains all in/excluded files for a group', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const bundles = yield testee.generateConfiguration();
                const baseBundle = bundles[0];
                expect(baseBundle.common.include).to.have.length(2);
                expect(baseBundle.common.include).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'bootstrap.js');
                expect(baseBundle.common.include).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'component.js');
                expect(baseBundle.common.exclude).to.have.length(1);
                expect(baseBundle.common.exclude).to.contain('base' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js');
                expect(baseBundle.core.include).to.have.length(1);
                expect(baseBundle.core.include).to.contain('base' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js');
                expect(baseBundle.core.exclude).to.have.length(2);
                expect(baseBundle.core.exclude).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'bootstrap.js');
                expect(baseBundle.core.exclude).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'component.js');
            });
            return promise;
        });

        it('should generate bundle configs for extended sites that contains all in/excluded files for a group', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const bundles = yield testee.generateConfiguration();
                const extendedBundle = bundles[1];
                expect(extendedBundle.common.include).to.have.length(2);
                expect(extendedBundle.common.include).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'bootstrap.js');
                expect(extendedBundle.common.include).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'component.js');
                expect(extendedBundle.common.exclude).to.have.length(2);
                expect(extendedBundle.common.exclude).to.contain('base' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js');
                expect(extendedBundle.common.exclude).to.contain('extended' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js');
                expect(extendedBundle.extended.include).to.have.length(2);
                expect(extendedBundle.extended.include).to.contain('base' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js');
                expect(extendedBundle.extended.include).to.contain('extended' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js');
                expect(extendedBundle.extended.exclude).to.have.length(2);
                expect(extendedBundle.extended.exclude).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'bootstrap.js');
                expect(extendedBundle.extended.exclude).to.contain('base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'component.js');
            });
            return promise;
        });
    });

    describe('#compileBundle()', function()
    {
        it('should create a file for a configured bundle group', function()
        {
            const promise = co(function *()
            {
                const bundleConfiguration =
                {
                    common:
                    {
                        filename: 'base/common.js',
                        prepend: [],
                        append: [],
                        include: [ 'base/common/js/bootstrap.js', 'base/common/js/component.js' ],
                        exclude: [ 'base/modules/m001-gallery/js/m001-gallery.js' ]
                    }
                }
                const testee = createTestee();
                const files = yield testee.compileBundles(bundleConfiguration);
                //console.log(files[0].contents.toString());
            });
            return promise;
        });
    });
});
