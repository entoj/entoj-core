"use strict";

/**
 * Requirements
 */
const BaseFilter = require(SOURCE_ROOT + '/nunjucks/filter/BaseFilter.js').BaseFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(BaseFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(BaseFilter, 'nunjucks.filter/BaseFilter');


    describe('#filter()', function()
    {
        it('should evaluate to a empty string', function()
        {
            const testee = new BaseFilter();
            expect(testee.filter()()).to.be.equal('');
        });
    });
});
