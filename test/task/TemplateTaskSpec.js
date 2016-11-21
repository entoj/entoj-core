"use strict";

/**
 * Requirements
 */
const TemplateTask = require(SOURCE_ROOT + '/task/TemplateTask.js').TemplateTask;
const ReadFilesTask = require(SOURCE_ROOT + '/task/ReadFilesTask.js').ReadFilesTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const EntityId = require(SOURCE_ROOT + '/model/entity/EntityId.js').EntityId;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');




/**
 * Spec
 */
describe(TemplateTask.className, function()
{
    /**
     * BaseTask Test
     */
    //baseTaskSpec(TemplateTask, 'task/TemplateTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * TemplateTask Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = false;
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/TemplateTask/entity/**/*.*');
    });


    describe('#stream()', function()
    {
        it('should passthrough all files', function()
        {
            const promise = co(function *()
            {
                const options =
                {
                    readPath: fixtures.path,
                    templateData:
                    {
                        entityId: fixtures.entityIdGallery
                    }
                };
                const reader = new ReadFilesTask(fixtures.cliLogger);
                const testee = new TemplateTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(reader.stream(undefined, undefined, options), undefined, options));
                expect(data).to.have.length(4);
            });
            return promise;
        });

        it('should process all files as templates', function()
        {
            const promise = co(function *()
            {
                const options =
                {
                    readPath: fixtures.path,
                    templateData:
                    {
                        entityId: fixtures.entityIdGallery
                    }
                };
                const reader = new ReadFilesTask(fixtures.cliLogger);
                const testee = new TemplateTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(reader.stream(undefined, undefined, options), undefined, options));
                expect(data).to.have.length(4);
                for (const file of data)
                {
                    expect(file.contents.toString()).to.not.contain('<$ entityId');
                }
            });
            return promise;
        });

        it('should allow to configure files that should just pass through', function()
        {
            const promise = co(function *()
            {
                const options =
                {
                    readPath: fixtures.path,
                    passthroughFiles: ['.j2'],
                    templateData:
                    {
                        entityId: fixtures.entityIdGallery
                    }
                };
                const reader = new ReadFilesTask(fixtures.cliLogger);
                const testee = new TemplateTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(reader.stream(undefined, undefined, options), undefined, options));
                expect(data).to.have.length(4);
                for (const file of data)
                {
                    if (file.path.endsWith('.j2'))
                    {
                        expect(file.contents.toString()).to.contain('<$ entityId');
                    }
                    else
                    {
                        expect(file.contents.toString()).to.not.contain('<$ entityId');
                    }
                }
            });
            return promise;
        });
    });
});
