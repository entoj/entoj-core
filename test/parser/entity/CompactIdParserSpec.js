'use strict';

/**
 * Requirements
 */
const CompactIdParser = require(SOURCE_ROOT + '/parser/entity/CompactIdParser.js').CompactIdParser;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(CompactIdParser.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#parse()', function()
    {
        describe('useNumbers = false', function()
        {
            it('should resolve to a valid entity when given string like m-gallery', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository, { useNumbers: false });
                const promise = testee.parse('m-gallery').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModule);
                    expect(result.entityName).to.be.equal('gallery');
                    expect(result.entityNumber).to.be.equal(0);
                });
                return promise;
            });

            it('should resolve to a valid entity category when given a string like /default/common', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository, { useNumbers: false });
                const promise = testee.parse('/default/common').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.siteName).to.be.equal('default');
                    expect(result.entityCategory).to.be.equal(fixtures.categoryCommon);
                });
                return promise;
            });

            it('should resolve to a valid entity when given a full compact id like /base/module-groups/g-gallery', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository, { useNumbers: false });
                const promise = testee.parse('/default/module-groups/g-gallery').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModuleGroup);
                    expect(result.entityName).to.be.equal('gallery');
                    expect(result.entityNumber).to.be.equal(0);
                    expect(result.siteName).to.be.equal('default');
                });
                return promise;
            });

            it('should accept windows style slashes like \\whatever\\base\\modules\\m-teaser\\js\\test.js', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository, { useNumbers: false });
                const promise = testee.parse('\\whatever\\base\\modules\\m-teaser\\js\\test.js').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModule);
                    expect(result.entityName).to.be.equal('teaser');
                    expect(result.entityNumber).to.be.equal(0);
                    expect(result.siteName).to.be.equal('base');
                });
                return promise;
            });

            it('should ignore anything around valid path like /whatever/default/modules/m-gallery/test.j2', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository, { useNumbers: false });
                const promise = testee.parse('/whatever/default/modules/m-gallery/test.j2').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModule);
                    expect(result.entityName).to.be.equal('gallery');
                    expect(result.entityNumber).to.be.equal(0);
                    expect(result.siteName).to.be.equal('default');
                });
                return promise;
            });

            xit('should handle trailing pathes that look like entities gracefully /hamburg-sued-relaunch/sites/default/modules/m-gallery/test.j2', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository, { useNumbers: false });
                const promise = testee.parse('/hamburg-sued-relaunch/sites/default/modules/m-gallery/test.j2').then(function(result)
                {
                    console.log(result);
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModule);
                    expect(result.entityName).to.be.equal('gallery');
                    expect(result.entityNumber).to.be.equal(0);
                    expect(result.siteName).to.be.equal('default');
                });
                return promise;
            });

            it('should resolve to false when a unconfigured category is used like in x-gallery', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository, { useNumbers: false });
                return expect(testee.parse('x-gallery')).to.eventually.be.equal(false);
            });
        });

        describe('useNumbers = true', function()
        {
            it('should resolve to a valid entity when given string like m001-gallery', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository);
                const promise = testee.parse('m001-gallery').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModule);
                    expect(result.entityName).to.be.equal('gallery');
                    expect(result.entityNumber).to.be.equal(1);
                });
                return promise;
            });

            it('should resolve to a valid category when given a string like /default/common', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository);
                const promise = testee.parse('/default/common').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.siteName).to.be.equal('default');
                    expect(result.entityCategory).to.be.equal(fixtures.categoryCommon);
                });
                return promise;
            });

            it('should resolve to a valid entity when given a full compact id like /base/module-groups/g001-gallery', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository);
                const promise = testee.parse('/default/module-groups/g001-gallery').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModuleGroup);
                    expect(result.entityName).to.be.equal('gallery');
                    expect(result.entityNumber).to.be.equal(1);
                    expect(result.siteName).to.be.equal('default');
                });
                return promise;
            });

            it('should accept windows style slashes like \\whatever\\base\\modules\\m002-teaser\\js\\test.js', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository);
                const promise = testee.parse('\\whatever\\base\\modules\\m002-teaser\\js\\test.js').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModule);
                    expect(result.entityName).to.be.equal('teaser');
                    expect(result.entityNumber).to.be.equal(2);
                    expect(result.siteName).to.be.equal('base');
                });
                return promise;
            });

            it('should ignore anything around valid path like /whatever/default/modules/m001-gallery/test.j2', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository);
                const promise = testee.parse('/whatever/default/modules/m001-gallery/test.j2').then(function(result)
                {
                    expect(result).to.be.ok;
                    expect(result.entityCategory).to.be.equal(fixtures.categoryModule);
                    expect(result.entityName).to.be.equal('gallery');
                    expect(result.entityNumber).to.be.equal(1);
                    expect(result.siteName).to.be.equal('default');
                });
                return promise;
            });

            it('should resolve to false when a unconfigured category is used like in x001-gallery', function()
            {
                const testee = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository);
                return expect(testee.parse('x001-gallery')).to.eventually.be.equal(false);
            });
        });
    });
});
