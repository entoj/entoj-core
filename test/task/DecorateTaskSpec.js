"use strict";

/**
 * Requirements
 */
const DecorateTask = require(SOURCE_ROOT + '/task/DecorateTask.js').DecorateTask;
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
describe(DecorateTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(DecorateTask, 'task/DecorateTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * DecorateTask Test
     */
    beforeEach(function()
    {
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = true;
    });


    describe('#stream()', function()
    {
        it('should decorate file contents with the configured templates', function(cb)
        {
            const sourceStream = through2(
            {
                objectMode: true
            });
            sourceStream.write(new VinylFile(
            {
                path: 'test.css',
                contents: new Buffer('test')
            }));
            sourceStream.end();

            const testee = new DecorateTask(fixtures.cliLogger, 'Before\n', '\nAfter');
            const stream = testee.stream(sourceStream, undefined, { path: fixtures.path })
                .on('data', (file) =>
                {
                    process.nextTick(() =>
                    {
                        expect(file.contents.toString()).to.contain('Before');
                        expect(file.contents.toString()).to.contain('After');
                    });
                })
                .on('finish', cb);
        });
    });
});
