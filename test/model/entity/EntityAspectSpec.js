'use strict';

/**
 * Requirements
 */
const EntityAspect = require(SOURCE_ROOT + '/model/entity/EntityAspect.js').EntityAspect;
const EntityIdTemplate = require(SOURCE_ROOT + '/model/entity/EntityIdTemplate.js').EntityIdTemplate;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const baseValueObjectSpec = require('../BaseValueObjectShared.js').spec;
const co = require('co');


/**
 * Spec
 */
describe(EntityAspect.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.entityIdTemplate = fixtures.context.di.create(EntityIdTemplate);
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        const promise = co(function *()
        {
            fixtures.entityGallery = yield fixtures.entitiesRepository.getById('m001-gallery');
            fixtures.siteBase = yield fixtures.sitesRepository.findBy(Site.NAME, 'base');
            fixtures.siteExtended = yield fixtures.sitesRepository.findBy(Site.NAME, 'extended');
        });
        return promise;
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a entity', function()
        {
            expect(function() { new EntityAspect(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a site', function()
        {
            expect(function() { new EntityAspect(fixtures.entityGallery); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a entity id template', function()
        {
            expect(function() { new EntityAspect(fixtures.entityGallery, fixtures.siteBase); }).to.throw(MissingArgumentError);
        });
    });


    describe('#idString', function()
    {
        it('should allow to get a string version of the entity id', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteBase, fixtures.entityIdTemplate);
            expect(testee.idString).to.be.equal('m001-gallery');
        });
    });


    describe('#pathString', function()
    {
        it('should allow to get a string version of the full entity path (/site/category/id)', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteBase, fixtures.entityIdTemplate);
            expect(testee.pathString).to.be.equal('/base/modules/m001-gallery');
        });
    });


    describe('#files', function()
    {
        it('should contain all files that are owned by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteBase, fixtures.entityIdTemplate);
            expect(testee.files.filter(file => file.contentType == ContentType.JINJA)).to.have.length(2);
            expect(testee.files.find(file => file.site === fixtures.siteBase && file.basename == 'm001-gallery.j2')).to.be.ok;
            expect(testee.files.find(file => file.site === fixtures.siteBase && file.basename == 'overview.j2')).to.be.ok;
            expect(testee.files.filter(file => file.contentType == ContentType.SASS)).to.have.length(1);
            expect(testee.files.find(file => file.site === fixtures.siteBase && file.basename == 'm001-gallery.scss')).to.be.ok;
        });

        it('should contain all files that are owned and extended by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteExtended, fixtures.entityIdTemplate);
            expect(testee.files.filter(file => file.contentType == ContentType.JINJA)).to.have.length(2);
            expect(testee.files.find(file => file.site === fixtures.siteBase && file.basename == 'm001-gallery.j2')).to.be.ok;
            expect(testee.files.find(file => file.site === fixtures.siteBase && file.basename == 'overview.j2')).to.be.ok;
            expect(testee.files.filter(file => file.contentType == ContentType.SASS)).to.have.length(2);
            expect(testee.files.find(file => file.site === fixtures.siteBase && file.basename == 'm001-gallery.scss')).to.be.ok;
            expect(testee.files.find(file => file.site === fixtures.siteExtended && file.basename == 'm001-gallery.scss')).to.be.ok;
        });
    });


    describe('#properties', function()
    {
        it('should contain all properties that are owned by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteBase, fixtures.entityIdTemplate);
            expect(testee.properties.getByPath('groups.js')).to.be.equal('core');
            expect(testee.properties.getByPath('groups.css')).to.be.equal('core');
        });

        it('should contain all properties that are extended by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteExtended, fixtures.entityIdTemplate);
            expect(testee.properties.getByPath('groups.js')).to.be.equal('extended');
            expect(testee.properties.getByPath('groups.css')).to.be.equal('core');
        });
    });


    describe('#documentation', function()
    {
        it('should contain all examples that are owned by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteBase, fixtures.entityIdTemplate);
            expect(testee.documentation.filter(doc => doc.contentKind == ContentKind.EXAMPLE)).to.have.length(1);
            expect(testee.documentation.find(doc => doc.name == 'overview.j2')).to.be.ok;
        });

        it('should contain all examples that are extended by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteExtended, fixtures.entityIdTemplate);
            expect(testee.documentation.filter(doc => doc.contentKind == ContentKind.EXAMPLE)).to.have.length(1);
            expect(testee.documentation.find(doc => doc.name == 'overview.j2')).to.be.ok;
        });

        it('should contain all macros that are owned by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteBase, fixtures.entityIdTemplate);
            expect(testee.documentation.filter(doc => doc.contentKind == ContentKind.MACRO)).to.have.length(2);
        });

        it('should contain all macros that are extended by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteExtended, fixtures.entityIdTemplate);
            expect(testee.documentation.filter(doc => doc.contentKind == ContentKind.MACRO)).to.have.length(2);
        });

        it('should contain all texts that are owned by the aspect', function()
        {
            const testee = new EntityAspect(fixtures.entityGallery, fixtures.siteBase, fixtures.entityIdTemplate);
            expect(testee.documentation.filter(doc => doc.contentKind == ContentKind.TEXT)).to.have.length(1);
            expect(testee.documentation.find(doc => doc.name == 'overview.j2')).to.be.ok;
        });
    });
});
