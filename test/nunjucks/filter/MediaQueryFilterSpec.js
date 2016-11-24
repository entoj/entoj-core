"use strict";

/**
 * Requirements
 */
const MediaQueryFilter = require(SOURCE_ROOT + '/nunjucks/filter/MediaQueryFilter.js').MediaQueryFilter;
const GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(MediaQueryFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(MediaQueryFilter, 'nunjucks.filter/MediaQueryFilter', prepareParameters);


    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.globalConfiguration);
        return parameters;
    };


    /**
     * MediaQueryFilter Test
     */
    beforeEach(function()
    {
        fixtures.options =
        {
            breakpoints:
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
            }
        };
        fixtures.globalConfiguration = new GlobalConfiguration(fixtures.options);
    });


    describe('#filter', function()
    {
        it('should return a media query for a breakpoint', function()
        {
            let testee = new MediaQueryFilter(fixtures.globalConfiguration);
            expect(testee.filter()('tablet')).to.contain('min-width: 321px');
            expect(testee.filter()('tablet')).to.contain('max-width: 1199px');
        });

        it('should return a media query for a breakpoint and above', function()
        {
            let testee = new MediaQueryFilter(fixtures.globalConfiguration);
            expect(testee.filter()('tabletAndAbove')).to.contain('min-width: 321px');
        });

        it('should return a media query for a breakpoint and below', function()
        {
            let testee = new MediaQueryFilter(fixtures.globalConfiguration);
            expect(testee.filter()('tabletAndBelow')).to.contain('max-width: 1199px');
        });
    });
});
