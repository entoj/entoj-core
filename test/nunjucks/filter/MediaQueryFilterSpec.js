"use strict";

/**
 * Requirements
 */
let MediaQueryFilter = require(SOURCE_ROOT + '/nunjucks/filter/MediaQueryFilter.js').MediaQueryFilter;
let nunjucks = require('nunjucks');
let baseSpec = require('../../BaseShared.js').spec;


/**
 * Spec
 */
describe(MediaQueryFilter.className, function()
{
    baseSpec(MediaQueryFilter, 'nunjucks.filter/MediaQueryFilter', function(parameters)
    {
        parameters.unshift(fixtures.environment);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = {};
        fixtures.breakpoints =
        {
            desktop:
            {
                minWidth: '1200px'
            },
            tablet:
            {
                maxWidth: '1199px',
                minWidth: '321px'
            },
            mobile:
            {
                maxWidth: '320px'
            }
        };
        fixtures.environment = new nunjucks.Environment();
    });


    describe('#execute', function()
    {
        it('should return a media query for a breakpoint', function()
        {
            let testee = new MediaQueryFilter(fixtures.environment, fixtures.breakpoints);
            expect(testee.execute()('tablet')).to.contain('min-width: 321px');
            expect(testee.execute()('tablet')).to.contain('max-width: 1199px');
        });

        it('should return a media query for a breakpoint and above', function()
        {
            let testee = new MediaQueryFilter(fixtures.environment, fixtures.breakpoints);
            expect(testee.execute()('tabletAndAbove')).to.contain('min-width: 321px');
        });

        it('should return a media query for a breakpoint and below', function()
        {
            let testee = new MediaQueryFilter(fixtures.environment, fixtures.breakpoints);
            expect(testee.execute()('tabletAndBelow')).to.contain('max-width: 1199px');
        });
    });
});
