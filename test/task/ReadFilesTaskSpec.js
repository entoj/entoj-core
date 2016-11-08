"use strict";

/**
 * Requirements
 */
const ReadFilesTask = require(SOURCE_ROOT + '/task/ReadFilesTask.js').ReadFilesTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const through2 = require('through2');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const sinon = require('sinon');



/**
 * Spec
 */
describe(ReadFilesTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(ReadFilesTask, 'task/ReadFilesTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * WriteFilesTask Test
     */
    beforeEach(function()
    {
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = true;
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/ReadFilesTask/**/*.css');
    });


    describe('#stream()', function()
    {
        it('should read files from the filesystem', function()
        {
            const promise = co(function *()
            {
                const testee = new ReadFilesTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(undefined, undefined, { path: fixtures.path }));
                expect(data).to.have.length(2);
                for (const file of data)
                {
                    expect(file.path).to.endWith('.css');
                }
            });
            return promise;
        });
    });
});
