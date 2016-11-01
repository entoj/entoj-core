"use strict";

/**
 * Requirements
 */
const EnvironmentTask = require(SOURCE_ROOT + '/task/EnvironmentTask.js').EnvironmentTask;
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
describe(EnvironmentTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(EnvironmentTask, 'task/EnvironmentTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * EnvironmentTask Test
     */
    beforeEach(function()
    {
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = true;
    });


    describe('#stream()', function()
    {
        it('should activate environments', function(cb)
        {
            // Input & Expectations
            const input = `All/* +environment: development */-Development/* -environment *//* +environment: production */-Production/* -environment */`;
            const expected = `All-Production`;

            // Stream
            const sourceStream = through2(
            {
                objectMode: true
            });
            sourceStream.write(new VinylFile(
            {
                path: 'test.css',
                contents: new Buffer(input)
            }));
            sourceStream.end();

            // Test
            const testee = new EnvironmentTask(fixtures.cliLogger);
            const stream = testee.stream(sourceStream, undefined, { environment: 'production' })
                .on('data', (file) =>
                {
                    process.nextTick(() =>
                    {
                        expect(file.contents.toString().trim()).to.equal(expected.trim());
                    });
                })
                .on('finish', function()
                {
                    process.nextTick(cb);
                });
        });
    });
});
