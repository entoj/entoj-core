"use strict";

/**
 * Requirements
 */
let BreakpointFilter = require(SOURCE_ROOT + '/nunjucks/filter/BreakpointFilter.js').BreakpointFilter;
let nunjucks = require('nunjucks');
let baseSpec = require('../../BaseShared.js').spec;


/**
 * Spec
 */
describe(BreakpointFilter.className, function()
{
    baseSpec(BreakpointFilter, 'nunjucks.filter/BreakpointFilter', function(parameters)
    {
        parameters.unshift(fixtures.environment);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = {};
        fixtures.environment = new nunjucks.Environment();
    });


    describe('#execute', function()
    {
        it('should return a breakpoint setting for the given name', function()
        {
            let breakpoints =
            {
                desktop:
                {
                    minWidth: '1200px'
                }
            };
            let testee = new BreakpointFilter(fixtures.environment, breakpoints);
            expect(testee.execute()('desktop')).to.be.deep.equal(breakpoints.desktop);
        });
    });
});
