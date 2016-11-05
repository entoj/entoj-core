"use strict";


/**
 * Requirements
 */
const EmptyFilter = require(SOURCE_ROOT + '/nunjucks/filter/EmptyFilter.js').EmptyFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(EmptyFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(EmptyFilter, 'nunjucks.filter/EmptyFilter');

    /**
     * EmptyFilter Test
     */
    describe('#filter()', function()
    {
        it('should detect empty values', function()
        {
            const testee = new EmptyFilter();
            expect(testee.filter()({})).to.be.ok;
            expect(testee.filter()(true)).to.be.not.ok;
        });
    });
});
