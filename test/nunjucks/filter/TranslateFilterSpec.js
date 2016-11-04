"use strict";


/**
 * Requirements
 */
const TranslateFilter = require(SOURCE_ROOT + '/nunjucks/filter/TranslateFilter.js').TranslateFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(TranslateFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(TranslateFilter, 'nunjucks.filter/TranslateFilter');

    /**
     * TranslateFilter Test
     */
    describe('#filter()', function()
    {
        it('should return the translation for the given key', function()
        {
            const testee = new TranslateFilter({ translations: { 'navigation.close' : 'Schließen' }});
            expect(testee.filter()('navigation.close')).to.be.equal('Schließen');
        });

        it('should return the given key when translation is missing', function()
        {
            const testee = new TranslateFilter();
            expect(testee.filter()('navigation.close')).to.be.equal('navigation.close');
        });
    });
});
