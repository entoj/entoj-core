"use strict";

/**
 * Requirements
 */
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const EntityCategory = require(SOURCE_ROOT + '/model/entity/EntityCategory.js').EntityCategory;
const EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
const EntityAspect = require(SOURCE_ROOT + '/model/entity/EntityAspect.js').EntityAspect;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const DocumentationCallable = require(SOURCE_ROOT + '/model/documentation/DocumentationCallable.js').DocumentationCallable;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const compactApplication = require(FIXTURES_ROOT + '/Application/Compact.js');
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const co = require('co');


/**
 * Spec
 */
describe(GlobalRepository.className, function()
{
    /**
     * Base Test
     */
    baseSpec(GlobalRepository, 'model/GlobalRepository', function(parameters)
    {
        parameters.unshift(fixtures.entitiesRepository);
        parameters.unshift(fixtures.categoriesRepository);
        parameters.unshift(fixtures.sitesRepository);
        return parameters;
    });


    /**
     * GlobalRepository Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#resolve', function()
    {
        it('should resolve "*" to all Sites', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolve('*').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.site).to.have.length(2);
                expect(result.site[0]).to.be.instanceof(Site);
                expect(result.site[1]).to.be.instanceof(Site);
            });
            return promise;
        });

        it('should resolve "default" to a Site', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolve('default').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.site).to.be.instanceof(Site);
                expect(result.site.name).to.be.equal('Default');
            });
            return promise;
        });

        it('should resolve "common" to a EntityCategory', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolve('common').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.entityCategory).to.be.instanceof(EntityCategory);
                expect(result.entityCategory.longName).to.be.equal('Common');
            });
            return promise;
        });

        it('should resolve "m001-gallery" to a EntityAspect', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolve('m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.entity).to.be.instanceof(Entity);
                expect(result.entity.id.name).to.be.equal('gallery');
            });
            return promise;
        });

        it('should resolve "default/common/m001-gallery" to a EntityAspect', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolve('default/common/m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.entity).to.be.instanceof(EntityAspect);
                expect(result.entity.id.name).to.be.equal('gallery');
            });
            return promise;
        });

        it('should resolve "default/common" to a Site and EntityCategory', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolve('default/common').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.site).to.be.instanceof(Site);
                expect(result.site.name).to.be.equal('Default');
                expect(result.entityCategory).to.be.instanceof(EntityCategory);
                expect(result.entityCategory.longName).to.be.equal('Common');
            });
            return promise;
        });
    });

    describe('#resolveEntities', function()
    {
        it('should resolve "*" to all Entities', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolveEntities('*').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(6);
                expect(result[0]).to.be.instanceof(EntityAspect);
                expect(result[1]).to.be.instanceof(EntityAspect);
                expect(result[2]).to.be.instanceof(EntityAspect);
                expect(result[3]).to.be.instanceof(EntityAspect);
                expect(result[4]).to.be.instanceof(EntityAspect);
                expect(result[5]).to.be.instanceof(EntityAspect);
            });
            return promise;
        });

        it('should resolve "default" to all Entities of a Site', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolveEntities('default').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(3);
                expect(result[0]).to.be.instanceof(EntityAspect);
                expect(result[1]).to.be.instanceof(EntityAspect);
                expect(result[2]).to.be.instanceof(EntityAspect);
            });
            return promise;
        });

        it('should resolve "common" to all Entities of a EntityCategory', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolveEntities('common').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(Entity);
            });
            return promise;
        });

        it('should resolve "m001-gallery" to a Entity', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolveEntities('m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(Entity);
            });
            return promise;
        });

        it('should resolve "default/common/m001-gallery" to a EntityAspect', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolveEntities('default/common/m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(EntityAspect);
            });
            return promise;
        });

        it('should resolve "default/common" to all Entities of EntityCategory of a Site', function()
        {
            const testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            const promise = testee.resolveEntities('default/common').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(EntityAspect);
            });
            return promise;
        });
    });


    describe('#resolveMacro', function()
    {
        function createFixture()
        {
            const fixture = compactApplication.createFixture();
            fixture.sitesRepository = fixture.context.di.create(SitesRepository);
            fixture.categoriesRepository = fixture.context.di.create(EntityCategoriesRepository);
            fixture.entitiesRepository = fixture.context.di.create(EntitiesRepository);
            return fixture;
        }

        it('should resolve to false for a non existing site', function()
        {
            const fixture = createFixture();
            const testee = new GlobalRepository(fixture.sitesRepository, fixture.categoriesRepository, fixture.entitiesRepository);
            const promise = co(function *()
            {
                const macro = yield testee.resolveMacro('foo', 'm001_gallery');
                expect(macro).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to false for a non existing macro', function()
        {
            const fixture = createFixture();
            const testee = new GlobalRepository(fixture.sitesRepository, fixture.categoriesRepository, fixture.entitiesRepository);
            const promise = co(function *()
            {
                const macro = yield testee.resolveMacro('base', 'foo');
                expect(macro).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to a existing macro when given a valid site and macro name', function()
        {
            const fixture = createFixture();
            const testee = new GlobalRepository(fixture.sitesRepository, fixture.categoriesRepository, fixture.entitiesRepository);
            const promise = co(function *()
            {
                const macro = yield testee.resolveMacro('base', 'm001_gallery');
                expect(macro).to.be.instanceof(DocumentationCallable);
                expect(macro.name).to.be.equal('m001_gallery');
            });
            return promise;
        });

        it('should resolve to a existing macro when given a valid site and a macro name', function()
        {
            const fixture = createFixture();
            const testee = new GlobalRepository(fixture.sitesRepository, fixture.categoriesRepository, fixture.entitiesRepository);
            const promise = co(function *()
            {
                const site = yield fixture.sitesRepository.findBy(Site.ANY, 'base');
                const macro = yield testee.resolveMacro(site, 'm001_gallery');
                expect(macro).to.be.instanceof(DocumentationCallable);
                expect(macro.name).to.be.equal('m001_gallery');
            });
            return promise;
        });
    });
});
