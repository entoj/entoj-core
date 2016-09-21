"use strict";

/**
 * Requirements
 */
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const EntityCategory = require(SOURCE_ROOT + '/model/entity/EntityCategory.js').EntityCategory;
const Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
const EntityAspect = require(SOURCE_ROOT + '/model/entity/EntityAspect.js').EntityAspect;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');


/**
 * Spec
 */
describe(GlobalRepository.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            expect(testee.className).to.be.equal('model/GlobalRepository');
        });
    });


    describe('#resolve', function()
    {
        it('should resolve "*" to all Sites', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolve('*').then(function(result)
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
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolve('default').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.site).to.be.instanceof(Site);
                expect(result.site.name).to.be.equal('Default');
            });
            return promise;
        });

        it('should resolve "common" to a EntityCategory', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolve('common').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.entityCategory).to.be.instanceof(EntityCategory);
                expect(result.entityCategory.longName).to.be.equal('Common');
            });
            return promise;
        });

        it('should resolve "m001-gallery" to a EntityAspect', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolve('m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.entity).to.be.instanceof(Entity);
                expect(result.entity.id.name).to.be.equal('gallery');
            });
            return promise;
        });

        it('should resolve "default/common/m001-gallery" to a EntityAspect', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolve('default/common/m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result.entity).to.be.instanceof(EntityAspect);
                expect(result.entity.id.name).to.be.equal('gallery');
            });
            return promise;
        });

        it('should resolve "default/common" to a Site and EntityCategory', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolve('default/common').then(function(result)
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
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolveEntities('*').then(function(result)
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
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolveEntities('default').then(function(result)
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
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolveEntities('common').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(Entity);
            });
            return promise;
        });

        it('should resolve "m001-gallery" to a Entity', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolveEntities('m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(Entity);
            });
            return promise;
        });

        it('should resolve "default/common/m001-gallery" to a EntityAspect', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolveEntities('default/common/m001-gallery').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(EntityAspect);
            });
            return promise;
        });

        it('should resolve "default/common" to all Entities of EntityCategory of a Site', function()
        {
            let testee = new GlobalRepository(fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            let promise = testee.resolveEntities('default/common').then(function(result)
            {
                expect(result).to.be.ok;
                expect(result).to.have.length(1);
                expect(result[0]).to.be.instanceof(EntityAspect);
            });
            return promise;
        });
    });
});
