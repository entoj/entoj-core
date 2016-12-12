"use strict";


/**
 * Requirements
 */
const MarkupFilter = require(SOURCE_ROOT + '/nunjucks/filter/MarkupFilter.js').MarkupFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(MarkupFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(MarkupFilter, 'nunjucks.filter/MarkupFilter');


    /**
     * MarkupFilter Test
     */
    describe('#filter()', function()
    {
        it('should wrap the given model into a <p>', function()
        {
            const testee = new MarkupFilter();
            expect(testee.filter()()).to.be.equal('<p></p>');
            expect(testee.filter()('Hi')).to.be.equal('<p>Hi</p>');
        });
    });
});
