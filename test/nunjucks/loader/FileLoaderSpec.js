"use strict";

/**
 * Requirements
 */
const FileLoader = require(SOURCE_ROOT + '/nunjucks/loader/FileLoader.js').FileLoader;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const PATH_SEPERATOR = require('path').sep;


/**
 * Spec
 */
describe('nunjucks.loader/FileLoader', function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.pathes = fixtures.context.di.create(PathesConfiguration);
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
    });


    describe('#getSource', function()
    {
        it('should return contents for full pathes', function()
        {
            const testee = new FileLoader(fixtures.pathes.sites, fixtures.entitiesRepository);
            expect(testee.getSource('/base/modules/m001-gallery/m001-gallery.j2').src).to.contain('m001_gallery');
            expect(testee.getSource('/base/modules/m001-gallery/m001-gallery.j')).to.be.not.ok;
        });

        it('should return contents for simple aliases (.../m001-gallery => .../m001-gallery/m001-gallery.j2)', function()
        {
            const testee = new FileLoader(fixtures.pathes.sites, fixtures.entitiesRepository);
            expect(testee.getSource('/base/modules/m001-gallery').path).to.contain(PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'm001-gallery.j2');
            expect(testee.getSource('/base/modules/m001-galler')).to.be.not.ok;
        });

        it('should return contents for pathes with missing slashes', function()
        {
            const testee = new FileLoader(fixtures.pathes.sites, fixtures.entitiesRepository);
            expect(testee.getSource('base/modules/m001-gallery/m001-gallery.j2').src).to.contain('m001_gallery');
        });

        it('should auto generate includes', function()
        {
            const testee = new FileLoader(fixtures.pathes.sites, fixtures.entitiesRepository);
            expect(testee.getSource('base/modules/m001-gallery/m001-gallery.j2').src).to.contain('include "/base/elements/e005-button/e005-button.j2"');
            expect(testee.getSource('base/modules/m001-gallery/m001-gallery.j2').src).to.not.contain('include "/base/modules/m001-gallery/m001-gallery.j2"');
        });
    });
});
