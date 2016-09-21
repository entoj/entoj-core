"use strict";

/**
 * Requirements
 */
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const path = require('path');

/**
 * Spec
 * @todo change form contains to endsWith
 */
describe(PathesConfiguration.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new PathesConfiguration();
            expect(testee.className).to.be.equal('model.configuration/PathesConfiguration');
        });
    });


    describe('#constructor()', function()
    {
        it('should resolve given root path', function()
        {
            let testee = new PathesConfiguration({ root: __dirname + '/..'});
            expect(testee.root).to.be.equal(path.resolve(__dirname + '/..'));
        });

        it('should uses "cache" as a default path for the cache', function()
        {
            let testee = new PathesConfiguration({ root: __dirname });
            expect(testee.cache).to.be.equal(path.resolve(__dirname + '/cache'));
        });

        it('should generate a cache path based on given template', function()
        {
            let testee = new PathesConfiguration({ root: __dirname, cacheTemplate: '${root}/c'});
            expect(testee.cache).to.be.equal(path.resolve(__dirname + '/c'));
        });

        it('should uses "data" as a default path for the cache', function()
        {
            let testee = new PathesConfiguration({ root: __dirname });
            expect(testee.data).to.be.equal(path.resolve(__dirname + '/data'));
        });

        it('should generate a data path based on given template', function()
        {
            let testee = new PathesConfiguration({ root: __dirname, dataTemplate: '${root}/d'});
            expect(testee.data).to.be.equal(path.resolve(__dirname + '/d'));
        });

        it('should uses "sites" as a default path for sites', function()
        {
            let testee = new PathesConfiguration({ root: __dirname });
            expect(testee.sites).to.be.equal(path.resolve(__dirname + '/sites'));
        });

        it('should generate a sites path based on given template', function()
        {
            let testee = new PathesConfiguration({ root: __dirname, sitesTemplate: '${root}/tpl'});
            expect(testee.sites).to.be.equal(path.resolve(__dirname + '/tpl'));
        });
    });


    describe('#resolveCache', function()
    {
        it('should return a path based on the configured cache template', function()
        {
            let testee = new PathesConfiguration({ root: '/', cacheTemplate: '${root}/yes' });
            let promise = expect(testee.resolveCache('css'))
                .to.eventually.contains(path.sep + 'yes' + path.sep + 'css');
            return promise;
        });

    });


    describe('#resolveSite', function()
    {
        it('should return a path based on the given site', function()
        {
            let testee = new PathesConfiguration({ root: '/', siteTemplate: '${sites}/yes/${site.name}' });
            let promise = expect(testee.resolveSite(fixtures.siteDefault))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'yes' + path.sep + 'Default');
            return promise;
        });

        it('should allow to add a custom path', function()
        {
            let testee = new PathesConfiguration({ root: '/', siteTemplate: '${sites}/yes/${site.name}' });
            let promise = expect(testee.resolveSite(fixtures.siteDefault, '/${site.name}'))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'yes' + path.sep + 'Default' + path.sep + 'Default');
            return promise;
        });
    });


    describe('#resolveEntityCategory', function()
    {
        it('should return a path based on the given category', function()
        {
            let testee = new PathesConfiguration({ root: '/',  entityCategoryTemplate: '${sites}/${site.name}/${entityCategory.shortName}' });
            let promise = expect(testee.resolveEntityCategory(fixtures.siteDefault, fixtures.categoryElement))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'e');
            return promise;
        });

        it('should allow to add a custom path', function()
        {
            let testee = new PathesConfiguration({ root: '/',  entityCategoryTemplate: '${sites}/${site.name}/${entityCategory.shortName}' });
            let promise = expect(testee.resolveEntityCategory(fixtures.siteDefault, fixtures.categoryElement, '/${entityCategory.longName}'))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'e' + path.sep + 'Element');
            return promise;
        });

        it('should allow to use helpers on prototype', function()
        {
            let testee = new PathesConfiguration({ root: '/',  entityCategoryTemplate: '${sites}/${site.name}/${entityCategory.pluralName.urlify()}' });
            let promise = expect(testee.resolveEntityCategory(fixtures.siteDefault, fixtures.categoryModuleGroup))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'module-groups');
            return promise;
        });
    });


    describe('#resolveEntityId', function()
    {
        it('should return a path based on the given entity id', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolveEntityId(fixtures.entityIdGallery))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'm' + path.sep + 'gallery');
            return promise;
        });

        it('should return a path based on the given global entity id', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdGlobalTemplate: '${sites}/${site.name}/${entityCategory.shortName}' });
            let promise = expect(testee.resolveEntityId(fixtures.entityIdCommon))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'c');
            return promise;
        });

        it('should allow to add a custom path', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolveEntityId(fixtures.entityIdGallery, '-${entityId.number.format(3)}'))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'm' + path.sep + 'gallery-001');
            return promise;
        });
    });


    describe('#resolveEntityIdForSite', function()
    {
        it('should return a path based on the given entity id and site', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolveEntityIdForSite(fixtures.entityIdGallery, fixtures.siteExtended))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Extended' + path.sep + 'm' + path.sep + 'gallery');
            return promise;
        });
    });


    describe('#resolveEntity', function()
    {
        it('should return a path based on the given entity', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolveEntity(fixtures.entityGallery))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'm' + path.sep + 'gallery');
            return promise;
        });

        it('should return a path based on the given global entity', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdGlobalTemplate: '${sites}/${site.name}/${entityCategory.shortName}' });
            let promise = expect(testee.resolveEntity(fixtures.entityCommon))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'c');
            return promise;
        });

        it('should allow to add a custom path', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolveEntity(fixtures.entityGallery, '-${entityId.number.format(3)}'))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'm' + path.sep + 'gallery-001');
            return promise;
        });
    });


    describe('#resolveEntityForSite', function()
    {
        it('should return a path based on the given entity and site', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolveEntityForSite(fixtures.entityGallery, fixtures.siteExtended))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Extended' + path.sep + 'm' + path.sep + 'gallery');
            return promise;
        });
    });


    describe('#resolve', function()
    {
        it('should return a path based on the given site', function()
        {
            let testee = new PathesConfiguration({ root: '/', siteTemplate: '${sites}/yes/${site.name}' });
            let promise = expect(testee.resolve(fixtures.siteDefault))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'yes' + path.sep + 'Default');
            return promise;
        });

        it('should return a path based on the given entity', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolve(fixtures.entityGallery))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'm' + path.sep + 'gallery');
            return promise;
        });

        it('should return a path based on the given entity id', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolve(fixtures.entityIdGallery))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'm' + path.sep + 'gallery');
            return promise;
        });

        it('should return a path based on the given template', function()
        {
            let testee = new PathesConfiguration({ root: '/' });
            let promise = expect(testee.resolve('${cache}/css'))
                .to.eventually.contains(path.sep + 'cache' + path.sep + 'css');
            return promise;
        });

        it('should allow to add a custom path', function()
        {
            let testee = new PathesConfiguration({ root: '/', entityIdTemplate: '${sites}/${site.name}/${entityCategory.shortName}/${entityId.name}' });
            let promise = expect(testee.resolve(fixtures.entityGallery, '-${entityId.number.format(3)}'))
                .to.eventually.contains(path.sep + 'sites' + path.sep + 'Default' + path.sep + 'm' + path.sep + 'gallery-001');
            return promise;
        });
    });
});
