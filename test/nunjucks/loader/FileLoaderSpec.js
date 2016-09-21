"use strict";

/**
 * Requirements
 */
const FileLoader = require(SOURCE_ROOT + '/nunjucks/loader/FileLoader.js').FileLoader;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const PATH_SEPERATOR = require('path').sep;


/**
 * Spec
 */
describe('nunjucks.loader/FileLoader', function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#getSource', function()
    {
        it('should return contents for full pathes', function()
        {
            let testee = new FileLoader(fixtures.pathes.sites);
            expect(testee.getSource('/default/modules/m001-gallery/m001-gallery.j2').src).to.contain('m001_gallery');
            expect(testee.getSource('/default/modules/m001-gallery/m001-gallery.j')).to.be.not.ok;
        });

        it('should return contents for simple aliases (.../m001-gallery => .../m001-gallery/m001-gallery.j2)', function()
        {
            let testee = new FileLoader(fixtures.pathes.sites);
            expect(testee.getSource('/default/modules/m001-gallery').path).to.contain(PATH_SEPERATOR + 'm001-gallery' + PATH_SEPERATOR + 'm001-gallery.j2');
            expect(testee.getSource('/default/modules/m001-galler')).to.be.not.ok;
        });

        it('should return contents for pathes with missing slashed', function()
        {
            let testee = new FileLoader(fixtures.pathes.sites);
            expect(testee.getSource('default/modules/m001-gallery/m001-gallery.j2').src).to.contain('m001_gallery');
        });
    });
});
