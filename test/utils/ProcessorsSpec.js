'use strict';

/**
 * Requirements
 */
const breakpointsToMediaQueries = require(SOURCE_ROOT + '/utils/processors.js').breakpointsToMediaQueries;

/**
 * Spec
 */
describe('utils/processors', function()
{
    describe('#breakpointsToMediaQueries', function()
    {
        it('should create media queries', function()
        {
            const breakpoints =
            {
                application:
                {
                    minWidth: '1280px'
                },
                phablet:
                {
                    minWidth: '376px',
                    maxWidth: '767px'
                },
                mobile:
                {
                    maxWidth: '375px'
                }
            };
            const mediaQueries =
            {
                application: '(min-width: 1280px)',
                applicationAndAbove: '(min-width: 1280px)',
                mobile: '(max-width: 375px)',
                mobileAndBelow: '(max-width: 375px)',
                phablet: '(min-width: 376px) and (max-width: 767px)',
                phabletAndAbove: '(min-width: 376px)',
                phabletAndBelow: '(max-width: 767px)'
            };
            expect(breakpointsToMediaQueries(breakpoints)).to.be.deep.equal(mediaQueries);
        });
    });
});
