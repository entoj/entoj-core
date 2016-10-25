"use strict";

/**
 * Requirements
 */
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const IdParser = require(SOURCE_ROOT + '/parser/entity/IdParser.js').IdParser;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const EntitiesLoader = require(SOURCE_ROOT + '/model/entity/EntitiesLoader.js').EntitiesLoader;
const Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const baseLoaderSpec = require('../BaseLoaderShared.js');
const co = require('co');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');


/**
 * Spec
 */
describe(EntitiesLoader.className, function()
{
    baseLoaderSpec(EntitiesLoader, 'model.entity/EntitiesLoader', function(parameters)
    {
        parameters.unshift(fixtures.sitesRepository, fixtures.categoriesRepository,
            fixtures.idParser, fixtures.pathesConfiguration, fixtures.plugins);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.categoriesRepository = fixtures.context.di.create(EntityCategoriesRepository);
        fixtures.idParser = fixtures.context.di.create(IdParser);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.plugins = fixtures.context.di.create('model.entity/EntitiesLoader.plugins');
    });


    describe('#load', function()
    {
        it('should resolve to Entity instances extracted from the given directory structure', function()
        {
            const testee = new EntitiesLoader(fixtures.sitesRepository, fixtures.categoriesRepository,
                fixtures.idParser, fixtures.pathesConfiguration, fixtures.plugins);
            const promise = co(function *()
            {
                const items = yield testee.load();
                expect(items).to.have.length(3);
                expect(items.find(item => item.id.name == 'button')).to.be.instanceof(Entity);
                expect(items.find(item => item.id.name == 'gallery')).to.be.instanceof(Entity);
                expect(items.find(item => item.id.category.longName == 'Common')).to.be.instanceof(Entity);
            });
            return promise;
        });

        it('should resolve to Entity instances that have a Site assigned', function()
        {
            const testee = new EntitiesLoader(fixtures.sitesRepository, fixtures.categoriesRepository,
                fixtures.idParser, fixtures.pathesConfiguration, fixtures.plugins);
            const promise = co(function *()
            {
                const items = yield testee.load();
                expect(items).to.have.length(3);
                expect(items.find(item => item.id.name == 'button').id.site).to.be.instanceof(Site);
                expect(items.find(item => item.id.name == 'gallery').id.site).to.be.instanceof(Site);
                expect(items.find(item => item.id.category.longName == 'Common').id.site).to.be.instanceof(Site);
            });
            return promise;
        });

        it('should resolve to Entity instances that knows each Site it is used in (via extend)', function()
        {
            const testee = new EntitiesLoader(fixtures.sitesRepository, fixtures.categoriesRepository,
                fixtures.idParser, fixtures.pathesConfiguration, fixtures.plugins);
            const promise = co(function *()
            {
                const siteExtended = yield fixtures.sitesRepository.findBy(Site.ANY, 'extended');
                const items = yield testee.load();
                expect(items).to.have.length(3);
                expect(items.find(item => item.id.name == 'button').usedBy).to.contain(siteExtended);
                expect(items.find(item => item.id.name == 'gallery').usedBy).to.contain(siteExtended);
                expect(items.find(item => item.id.category.longName == 'Common').usedBy).to.contain(siteExtended);
            });
            return promise;
        });

        it('should allow to load only specific entities', function()
        {
            const testee = new EntitiesLoader(fixtures.sitesRepository, fixtures.categoriesRepository,
                fixtures.idParser, fixtures.pathesConfiguration, fixtures.plugins);
            const promise = co(function *()
            {
                const items = yield testee.load(['/base/modules/m001-gallery', '/base/elements/e005-button']);
                expect(items).to.have.length(2);
                expect(items.find(item => item.id.name == 'button')).to.be.instanceof(Entity);
                expect(items.find(item => item.id.name == 'gallery')).to.be.instanceof(Entity);
            });
            return promise;
        });

        it('should ignore invalid entities', function()
        {
            const testee = new EntitiesLoader(fixtures.sitesRepository, fixtures.categoriesRepository,
                fixtures.idParser, fixtures.pathesConfiguration, fixtures.plugins);
            const promise = co(function *()
            {
                const items = yield testee.load(['/invalid/modules/m001-gallery']);
                expect(items).to.have.length(0);
            });
            return promise;
        });

        it('should load Files from base and extended versions ', function()
        {
            const testee = new EntitiesLoader(fixtures.sitesRepository, fixtures.categoriesRepository,
                fixtures.idParser, fixtures.pathesConfiguration, fixtures.plugins);
            const promise = co(function *()
            {
                const items = yield testee.load();
                const common = items.find(item => item.id.category.longName == 'Common');
                expect(common.files.filter(file => file.site.name === 'Base')).has.length(6);
                expect(common.files.filter(file => file.site.name === 'Extended')).has.length(1);
            });
            return promise;
        });
    });
});
