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
        it('should remove all environments when no environment is given', function(cb)
        {
            // Input & Expectations
            const input = `
            /**
             * Configure logger
             */
            let log = debug('global/application');
            /* +environment: development */
            debug.enable('*');
            /* -environment */
            /* +environment: production */
            debug.disable('*');
            /* -environment */`;
            const expected = `
            /**
             * Configure logger
             */
            let log = debug('global/application');`;

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
            const stream = testee.stream(sourceStream)
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

        it('should remove all environments except the given one', function(cb)
        {
            // Input & Expectations
            const input = `
            /**
             * Configure logger
             */
            let log = debug('global/application');
            /* +environment: development */
            debug.enable('*');
            /* -environment */
            /* +environment: production */
            debug.disable('*');
            /* -environment */`;

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
                        expect(file.contents.toString()).to.contain('debug.disable(\'*\');');
                    });
                })
                .on('finish', function()
                {
                    process.nextTick(cb);
                });
        });
    });
});
