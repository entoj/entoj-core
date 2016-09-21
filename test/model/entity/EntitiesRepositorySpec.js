"use strict";

/**
 * Requirements
 */
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
const EntityAspect = require(SOURCE_ROOT + '/model/entity/EntityAspect.js').EntityAspect;
const baseRepositorySpec = require('../BaseRepositoryShared.js').spec;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const co = require('co');


/**
 * Spec
 */
describe(EntitiesRepository.className, function()
{
    baseRepositorySpec(EntitiesRepository, 'model.entity/EntitiesRepository', function(parameters)
    {
        parameters.unshift(fixtures.compact.entityIdParser);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures.compact = compact.createFixture();
    });


    describe('#getBySite', function()
    {
        it('should return all entities for a given site', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entities = yield testee.getBySite(fixtures.compact.siteDefault);
                expect(entities).to.have.length(3);
                expect(entities.find(item => item.id.name == 'button')).to.be.ok;
                expect(entities.find(item => item.id.name == 'gallery')).to.be.ok;
                expect(entities.find(item => item.id.category.longName == 'Common')).to.be.ok;
            });
            return promise;
        });

        it('should return all inherited entities for a extended site', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entities = yield testee.getBySite(fixtures.compact.siteExtended);
                expect(entities).to.have.length(3);
                expect(entities.find(item => item.id.name == 'button')).to.be.ok;
                expect(entities.find(item => item.id.name == 'gallery')).to.be.ok;
                expect(entities.find(item => item.id.category.longName == 'Common')).to.be.ok;
            });
            return promise;
        });
    });


    describe('#getByCategory', function()
    {
        it('should return all entities for a given category', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entities = yield testee.getByCategory(fixtures.compact.categoryElement);
                expect(entities).to.have.length(1);
                expect(entities.find(item => item.id.name == 'button')).to.be.ok;
            });
            return promise;
        });
    });


    describe('#getBySiteAndCategory', function()
    {
        it('should return all entities for a given category in a given site', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entities = yield testee.getBySiteAndCategory(fixtures.compact.siteDefault, fixtures.compact.categoryElement);
                expect(entities).to.have.length(1);
                expect(entities.find(item => item.id.name == 'button')).to.be.ok;
            });
            return promise;
        });

        it('should return all entities for a given category in a given extended site', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entities = yield testee.getBySiteAndCategory(fixtures.compact.siteExtended, fixtures.compact.categoryElement);
                expect(entities).to.have.length(1);
                expect(entities.find(item => item.id.name == 'button')).to.be.ok;
            });
            return promise;
        });
    });


    describe('#getById', function()
    {
        it('should return a entity when given a full entityId string like "/sites/default/modules/m001-gallery"', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entity = yield testee.getById('/sites/default/modules/m001-gallery');
                expect(entity).to.be.instanceof(EntityAspect);
                expect(entity.id.name).to.be.equal('gallery');
            });
            return promise;
        });

        it('should return a entity when given a full extended entityId string like "/sites/extended/modules/m001-gallery"', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entity = yield testee.getById('/sites/extended/modules/m001-gallery');
                expect(entity).to.be.instanceof(EntityAspect);
                expect(entity.id.name).to.be.equal('gallery');
            });
            return promise;
        });

        it('should return a entity when given a partial entityId string like "m001-gallery"', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entity = yield testee.getById('m001-gallery');
                expect(entity).to.be.instanceof(Entity);
                expect(entity.id.name).to.be.equal('gallery');
            });
            return promise;
        });

        it('should return a entity when given a EntityId', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entity = yield testee.getById(fixtures.compact.entityIdButton);
                expect(entity).to.be.instanceof(EntityAspect);
                expect(entity.id.name).to.be.equal(fixtures.compact.entityButton.id.name);
            });
            return promise;
        });

        it('should allow to specify a specific site', function()
        {
            const testee = fixtures.compact.entitiesRepository;
            const promise = co(function *()
            {
                const entity = yield testee.getById(fixtures.compact.entityIdButton, fixtures.compact.siteExtended);
                expect(entity).to.be.instanceof(EntityAspect);
                expect(entity.id.site).to.be.equal(fixtures.compact.siteExtended);
            });
            return promise;
        });
    });
});

