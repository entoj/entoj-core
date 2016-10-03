"use strict";

/**
 * Requirements
 */
const JsRepository = require(SOURCE_ROOT + '/gulp/model/JsRepository.js').JsRepository;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const File = require(SOURCE_ROOT + '/model/file/File.js').File;
const VinylFile = require('vinyl');
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const PATH_SEPERATOR = require('path').sep;
const baseRepositorySpec = require(TEST_ROOT + '/gulp/model/BaseRepositoryShared.js');


/**
 * Spec
 */
describe(JsRepository.className, function()
{
    /**
     * BaseRepository Test
     */
    baseRepositorySpec(JsRepository, 'gulp.model/JsRepository');


    /**
     * JsRepository Test
     */
    beforeEach(function(done)
    {
        fixtures = compact.createFixture();

        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.siteBase = false;

        fixtures.sitesRepository.findBy('name', 'base').then(function(site)
        {
            fixtures.siteBase = site;
            done();
        });
    });


    describe('#getBundlesBySite()', function()
    {
        it('should resolve to an object containing all groups', function()
        {
            let testee = new JsRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            let promise = testee.getBundlesBySite(fixtures.siteBase).then(function(bundles)
            {
                expect(bundles.common).to.be.ok;
                expect(bundles.common.filename).to.be.equal('base' + PATH_SEPERATOR + 'common.js');

                expect(bundles.core).to.be.ok;
                expect(bundles.core.filename).to.be.equal('base' + PATH_SEPERATOR + 'core.js');
            });
            return promise;
        });

        it('should describe exactly which modules to in/exclude', function()
        {
            let testee = new JsRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            let promise = testee.getBundlesBySite(fixtures.siteBase).then(function(bundles)
            {
                // Common
                expect(bundles.common.include).to.have.length(1);
                expect(bundles.common.include.find(file => file === 'base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'bootstrap.js')).to.be.ok;
                expect(bundles.common.exclude).to.have.length(1);
                expect(bundles.common.exclude.find(file => file === 'base' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js')).to.be.ok;

                // Core
                expect(bundles.core.include).to.have.length(1);
                expect(bundles.core.include.find(file => file === 'base' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'm001-gallery.js')).to.be.ok;
                expect(bundles.core.exclude).to.have.length(1);
                expect(bundles.core.exclude.find(file => file === 'base' + PATH_SEPERATOR + 'common' + PATH_SEPERATOR + 'js' + PATH_SEPERATOR + 'bootstrap.js')).to.be.ok;
            });
            return promise;
        });
    });
});
