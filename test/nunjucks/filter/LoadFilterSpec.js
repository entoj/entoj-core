"use strict";

/**
 * Requirements
 */
const LoadFilter = require(SOURCE_ROOT + '/nunjucks/filter/LoadFilter.js').LoadFilter;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const CompactIdParser = require(SOURCE_ROOT + '/parser/entity/CompactIdParser.js').CompactIdParser;
const nunjucks = require('nunjucks');
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');


/**
 * Spec
 */
describe(LoadFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(LoadFilter, 'nunjucks.filter/LoadFilter', function(parameters)
    {
        parameters.unshift(fixtures.options);
        parameters.unshift(fixtures.pathesConfiguration);
        parameters.unshift(fixtures.entitiesRepository);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.path = FIXTURES_ROOT + '/Nunjucks/load';
        fixtures.options = {};
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.environment = new nunjucks.Environment();
    });


    /**
     * LoadFilter Test
     */
    describe('#filter', function()
    {
        it('should passthrough anything that is not a string', function()
        {
            const testee = new LoadFilter(fixtures.entitiesRepository,
                fixtures.pathesConfiguration, { path: fixtures.rootPath });
            const loaded = testee.filter()({ hell: 'yeah' });
            expect(loaded.hell).to.be.equal('yeah');
        });

        it('should load a json file', function()
        {
            const testee = new LoadFilter(fixtures.entitiesRepository,
                fixtures.pathesConfiguration, { path: fixtures.path });
            const loaded = testee.filter()('/simple.json');
            expect(loaded.name).to.be.equal('simple');
            expect(loaded.index).to.be.equal(1);
        });

        it('should load a json file for a entity like m001-gallery/default', function()
        {
            const testee = new LoadFilter(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const loaded = testee.filter()('m001-gallery/default');
            expect(loaded.name).to.be.equal('m001-gallery');
        });

        it('should allow a extending entity to override a model', function()
        {
            const siteExtended = synchronize.execute(fixtures.sitesRepository, 'findBy', [Site.ANY, 'extended']);
            const testee = new LoadFilter(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const filter = testee.filter();
            const loadedBase = filter.call(fixtures.environment, 'e005-button/default');
            fixtures.environment.addGlobal('site', siteExtended);
            const loadedExtended = filter.call(fixtures.environment, 'e005-button/default');
            expect(loadedBase.name).to.be.equal('e005-button');
            expect(loadedExtended.name).to.be.equal('e005-button-extended');
        });

        it('should generate random lipsum text via the @lipsum macro', function()
        {
            const testee = new LoadFilter(fixtures.entitiesRepository, fixtures.pathesConfiguration, { path: fixtures.path });
            const loaded1 = testee.filter()('/lipsum.json');
            const loaded2 = testee.filter()('/lipsum.json');
            expect(loaded1.name.length).to.be.above(0);
            expect(loaded2.name.length).to.be.above(0);
            expect(loaded1.name).to.be.not.equal(loaded2.name);
        });

        it('should allow to render static content with @lipsum macros', function()
        {
            const testee = new LoadFilter(fixtures.entitiesRepository, fixtures.pathesConfiguration, { path: fixtures.path });
            fixtures.environment.isStatic = true;
            testee.register(fixtures.environment);
            const loaded1 = testee.filter()('/lipsum.json');
            const loaded2 = testee.filter()('/lipsum.json');
            expect(loaded1.name.length).to.be.above(0);
            expect(loaded2.name.length).to.be.above(0);
            expect(loaded1.name).to.be.equal(loaded2.name);
        });

        it('should allow to load other json files via the @import macro', function()
        {
            const testee = new LoadFilter(fixtures.entitiesRepository, fixtures.pathesConfiguration, { path: fixtures.path });
            const loaded = testee.filter()('/import.json');
            expect(loaded.lipsum.name.length).to.be.above(0);
            expect(loaded.lipsum.index).to.be.equal(2);
        });
    });
});
