"use strict";

/**
 * Requirements
 */
const ExamplesArgumentBuilder = require(SOURCE_ROOT + '/server/routes/ExamplesArgumentBuilder.js').ExamplesArgumentBuilder;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const co = require('co');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');

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
        it('should ...', function()
        {
            const promise = co(function *()
            {
                const entitiesRepository = fixtures.context.di.create(EntitiesRepository);
                const entity = yield entitiesRepository.getById('/base/elements/e005-button');
                const testee = new ExamplesArgumentBuilder(fixtures.cliLogger);
                const result = yield testee.build(entity);
                return;
            });
            return promise;
        });
    });
});
