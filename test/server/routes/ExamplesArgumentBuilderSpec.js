"use strict";

/**
 * Requirements
 */
let ExamplesArgumentBuilder = require(SOURCE_ROOT + '/server/routes/ExamplesArgumentBuilder.js').ExamplesArgumentBuilder;
let CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
let request = require('supertest');
let compact = require(FIXTURES_ROOT + '/Application/Compact.js');

/**
 * Spec
 */
describe(ExamplesArgumentBuilder.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = new CliLogger('', { muted: true });
    });

    describe('#build', function()
    {
        it('should ...', function(cb)
        {
            const testee = new ExamplesArgumentBuilder(fixtures.cliLogger);
            const promise = testee.build()
                .then(function(result)
                {
                    console.log(result);
                    cb();
                });
        });
    });
});
