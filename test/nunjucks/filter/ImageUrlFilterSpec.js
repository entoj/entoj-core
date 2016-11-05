"use strict";

/**
 * Requirements
 */
const ImageUrlFilter = require(SOURCE_ROOT + '/nunjucks/filter/ImageUrlFilter.js').ImageUrlFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(ImageUrlFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(ImageUrlFilter, 'nunjucks.filter/ImageUrlFilter');


    /**
     * ImageUrlFilter Test
     */
    describe('#filter', function()
    {
        describe('mode=default', function()
        {
            it('should return a image url for the given filename', function()
            {
                const testee = new ImageUrlFilter();
                expect(testee.filter()('test.png')).to.contain('/images/test.png/0/0/0');
            });

            it('should allow to specify width, height and force', function()
            {
                const testee = new ImageUrlFilter();
                expect(testee.filter()('test.png', 200, 200, 1)).to.contain('/images/test.png/200/200/1');
            });
        });


        describe('mode=default', function()
        {
            it('should return a umbraco image helper', function()
            {
                const testee = new ImageUrlFilter({ mode: 'umbraco' });
                expect(testee.filter()('test.png', 200, 200)).to.contain('@image.GetCropUrl(width: 200, height: 200)');
            });
        });
    });
});
