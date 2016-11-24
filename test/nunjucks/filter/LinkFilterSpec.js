"use strict";


/**
 * Requirements
 */
const LinkFilter = require(SOURCE_ROOT + '/nunjucks/filter/LinkFilter.js').LinkFilter;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(LinkFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(LinkFilter, 'nunjucks.filter/LinkFilter');


    /**
     * LinkFilter Test
     */
    describe('#filter()', function()
    {
        it('should return a "empty" link when no model given', function()
        {
            const testee = new LinkFilter();
            expect(testee.filter()()).to.be.equal('JavaScript:;');
            expect(testee.filter()({})).to.be.equal('JavaScript:;');
        });

        it('should return the link to selfLink when given', function()
        {
            const testee = new LinkFilter();
            expect(testee.filter()({ selfLink: '/base' })).to.be.equal('/base');
        });

        it('should return the link to dataUrlBlob when given', function()
        {
            const testee = new LinkFilter();
            expect(testee.filter()({ dataUrlBlob: '/blob' })).to.be.equal('/blob');
        });

        it('should return the link to selfLink when selfLink and dataUrlBlob are given', function()
        {
            const testee = new LinkFilter();
            expect(testee.filter()({ selfLink: '/base', dataUrlBlob: '/blob' })).to.be.equal('/base');
        });
    });
});
