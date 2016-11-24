"use strict";


/**
 * Requirements
 */
const DebugFilter = require(SOURCE_ROOT + '/nunjucks/filter/DebugFilter.js').DebugFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(DebugFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(DebugFilter, 'nunjucks.filter/DebugFilter');


    /**
     * DebugFilter Test
     */
    describe('#filter()', function()
    {
        it('should return a detailed dump of the given variable', function()
        {
            const data =
            {
                data:
                {
                    foo: 'bar',
                    baz: 10
                }
            };
            const testee = new DebugFilter();
            expect(testee.filter()(data)).to.contain('"foo": "bar"');
            expect(testee.filter()(data)).to.contain('"baz": 10');
        });
    });
});
