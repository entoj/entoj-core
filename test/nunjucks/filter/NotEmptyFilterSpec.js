"use strict";


/**
 * Requirements
 */
const NotEmptyFilter = require(SOURCE_ROOT + '/nunjucks/filter/NotEmptyFilter.js').NotEmptyFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(NotEmptyFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(NotEmptyFilter, 'nunjucks.filter/NotEmptyFilter');


    /**
     * NotEmptyFilter Test
     */
    describe('#filter()', function()
    {
        it('should detect empty values', function()
        {
            const testee = new NotEmptyFilter();
            expect(testee.filter()({})).to.be.not.ok;
            expect(testee.filter()(true)).to.be.ok;
        });
    });
});
