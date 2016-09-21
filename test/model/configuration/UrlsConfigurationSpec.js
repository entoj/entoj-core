"use strict";

/**
 * Requirements
 */
const UrlsConfiguration = require(SOURCE_ROOT + '/model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const EntityCategory = require(SOURCE_ROOT + '/model/entity/EntityCategory.js').EntityCategory;
const EntityId = require(SOURCE_ROOT + '/model/entity/EntityId.js').EntityId;
const File = require(SOURCE_ROOT + '/model/file/File.js').File;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const path = require('path');

/**
 * Spec
 */
describe(UrlsConfiguration.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.createTestee = function(patterns)
        {
            return new UrlsConfiguration(patterns,
                fixtures.sitesRepository, fixtures.categoriesRepository,
                fixtures.entitiesRepository, fixtures.entityIdParser, fixtures.pathesConfiguration);
        }
    });

    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let patterns = {};
            let testee = fixtures.createTestee(undefined);
            expect(testee.className).to.be.equal('model.configuration/UrlsConfiguration');
        });
    });

/*
    describe('#resolveFile', function()
    {
        it('should resolve the file if it exists', function()
        {
            let urls = {};
            let testee = new fixtures.createTestee(urls);
            let promise = testee.resolveFile(fixtures.pathes.root + '/default/modules/m001-gallery/examples/default.j2').then(function(url)
                {
                    expect(url).to.be.equal('/default/modules/m001-gallery/examples/default.j2');
                });
            return promise;
        });
    });
*/


    describe('#resolveSite', function()
    {
        it('should require a valid Site', function()
        {
            let urls = { siteTemplate: '${root}/${site.name.toLowerCase()}' };
            let testee = new fixtures.createTestee(urls);
            expect(function() { testee.resolveSite({}); }).to.throw(TypeError);
        });

        it('should resolve to the configured path', function()
        {
            let urls = { siteTemplate: '${root}/test/${site.name.toLowerCase()}' };
            let testee = new fixtures.createTestee(urls);
            let promise = testee.resolveSite(fixtures.siteDefault).then(function(url)
            {
                expect(url).to.be.equal('/test/default');
            });
            return promise;
        });
    });


    describe('#matchSite', function()
    {
        it('should resolve to false when no site matched', function()
        {
            let patterns = { sitePattern: '${root}/:site' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchSite('/foo').then(function(match)
            {
                expect(match.site).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to the site when matched', function()
        {
            let patterns = { sitePattern: '${root}/:site' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchSite('/default').then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
            });
            return promise;
        });

        it('should only match complete pathes', function()
        {
            let patterns = { sitePattern: '${root}/:site' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchSite('/default/elements').then(function(match)
            {
                expect(match.site).to.be.not.ok;
                expect(match.entityCategory).to.be.not.ok;
            });
            return promise;
        });

        it('should allow to match direct site pathes with partial=true', function()
        {
            let patterns = { sitePattern: '${root}/:site' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchSite('/default', true).then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
            });
            return promise;
        });

        it('should allow to match partial pathes with partial=true', function()
        {
            let patterns = { sitePattern: '${root}/:site' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchSite('/default/elements/m001-gallery', true).then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
                expect(match.customPath).to.be.equal('/elements/m001-gallery');
            });
            return promise;
        });
    });


    describe('#resolveEntityCategory', function()
    {
        it('should require a valid Site and EntityCategory', function()
        {
            let urls = { entityCategoryTemplate: '${root}/${site.toLowerCase()}' };
            let testee = new fixtures.createTestee(urls);
            expect(function() { testee.resolveEntityCategory({}); }).to.throw(TypeError);
            expect(function() { testee.resolveEntityCategory(fixtures.siteDefault, {}); }).to.throw(TypeError);
        });

        it('should resolve to the configured path', function()
        {
            let urls = { templateUrl: '${root}/${site.toLowerCase()}/${entityCategory}.longName' };
            let testee = new fixtures.createTestee(urls);
            let promise = testee.resolveEntityCategory(fixtures.siteDefault, fixtures.categoryElement).then(function(url)
            {
                expect(url).to.be.equal('/default/elements');
            });
            return promise;
        });
    });


    describe('#matchEntityCategory', function()
    {
        it('should resolve to false when no category matched', function()
        {
            let patterns = { entityCategoryPattern: '${root}/:site/:entityCategory' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityCategory('/foo/bar').then(function(match)
            {
                expect(match.entityCategory).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to the category when matched', function()
        {
            let patterns = { entityCategoryPattern: '${root}/:site/:entityCategory' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityCategory('/default/module-groups').then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
                expect(match.entityCategory).to.be.equal(fixtures.categoryModuleGroup);
            });
            return promise;
        });

        it('should only match complete pathes', function()
        {
            let patterns = { entityCategoryPattern: '${root}/:site/:entityCategory' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityCategory('/default/elements/e001').then(function(match)
            {
                expect(match.site).to.be.not.ok;
                expect(match.entityCategory).to.be.not.ok;
            });
            return promise;
        });

        it('should allow to match partial pathes with partial=true', function()
        {
            let patterns = { entityCategoryPattern: '${root}/:site/:entityCategory' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityCategory('/default/elements/e001', true).then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
                expect(match.entityCategory).to.be.equal(fixtures.categoryElement);
                expect(match.customPath).to.be.equal('/e001');
            });
            return promise;
        });

        it('should match a direct category path with partial=true', function()
        {
            let patterns = { entityCategoryPattern: '${root}/:site/:entityCategory' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityCategory('/default/module-groups', true).then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
                expect(match.entityCategory).to.be.equal(fixtures.categoryModuleGroup);
            });
            return promise;
        });
    });


    describe('#resolveEntityId', function()
    {
        it('should require a valid EntityId', function()
        {
            let urls = { entityIdTemplate: '${root}/${site.name.toLowerCase()}' };
            let testee = new fixtures.createTestee(urls);
            expect(function() { testee.resolveEntityId({}); }).to.throw(TypeError);
        });

        it('should resolve to the configured path', function()
        {
            let urls = { entityIdTemplate: '${root}/${site.name.toLowerCase()}/${entityCategory.longName}/${entityId.name}' };
            let testee = new fixtures.createTestee(urls);
            let promise = testee.resolveEntityId(fixtures.entityIdGallery).then(function(url)
            {
                expect(url).to.be.equal('/default/Module/gallery');
            });
            return promise;
        });

        it('should resolve a global entity id to the configured category path', function()
        {
            let urls = { entityCategoryTemplate: '${root}/${site.name.toLowerCase()}/${entityCategory.longName.toLowerCase()}' };
            let testee = new fixtures.createTestee(urls);
            let promise = testee.resolveEntityId(fixtures.entityIdCommon).then(function(url)
            {
                expect(url).to.be.equal('/default/common');
            });
            return promise;
        });
    });


    describe('#matchEntityId', function()
    {
        it('should resolve to false when no entity matched', function()
        {
            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityId('/foo/bar/baz').then(function(match)
            {
                expect(match.entityId).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to the entity when matched', function()
        {
            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityId('/default/modules/m001-gallery').then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
                expect(match.entityCategory).to.be.instanceof(EntityCategory);
                expect(match.entityCategory).to.be.equal(fixtures.categoryModule);
                expect(match.entityId).to.be.instanceof(EntityId);
                expect(match.entityId.name).to.be.equal(fixtures.entityIdGallery.name);
                expect(match.entityId.site).to.be.equal(fixtures.entityIdGallery.site);
                expect(match.entityId.category).to.be.equal(fixtures.entityIdGallery.category);
            });
            return promise;
        });

        it('should only match complete pathes', function()
        {
            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityId('/default/modules/m001-gallery/readme.md').then(function(match)
            {
                expect(match.site).to.be.not.ok;
                expect(match.entityCategory).to.be.not.ok;
                expect(match.entityId).to.be.not.ok;
            });
            return promise;
        });

        it('should allow to match partial pathes with partial=true', function()
        {
            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityId('/default/modules/m001-gallery/readme.md', true).then(function(match)
            {
                expect(match.site).to.be.equal(fixtures.siteDefault);
                expect(match.entityCategory).to.be.equal(fixtures.categoryModule);
                expect(match.entityId).to.be.instanceof(EntityId);
                expect(match.customPath).to.be.equal('/readme.md');
            });
            return promise;
        });
    });


    describe('#matchEntityFile', function()
    {
        it('should resolve to false when no entity matched', function()
        {
            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityFile('/foo/bar/baz').then(function(match)
            {
                expect(match.entityId).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to a entity when matched', function()
        {
            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityFile('/default/modules/m001-gallery').then(function(match)
            {
                expect(match.entity).to.be.ok;
            });
            return promise;
        });

        it('should resolve to a file when matched', function()
        {
            let file = new File(fixtures.pathesConfiguration.root + '/default/modules/m001-gallery/examples/overview.j2');
            file.site = fixtures.siteDefault;
            fixtures.entityGallery.files.push(file);

            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityFile('/default/modules/m001-gallery/examples/overview.j2').then(function(match)
            {
                expect(match.file).to.be.ok;
                expect(match.file).to.be.equal(file);
            });
            return promise;
        });

        it('should resolve to a file when matched on a extended aspect', function()
        {
            let file = new File(fixtures.pathesConfiguration.root + '/default/modules/m001-gallery/examples/overview.j2');
            file.site = fixtures.siteDefault;
            fixtures.entityGallery.files.push(file);

            let patterns = { entityIdPattern: '${root}/:site/:entityCategory/:entityId' };
            let testee = new fixtures.createTestee(patterns);
            let promise = testee.matchEntityFile('/extended/modules/m001-gallery/examples/overview.j2').then(function(match)
            {
                expect(match.file).to.be.ok;
                expect(match.file).to.be.equal(file);
            });
            return promise;
        });
    });
});
