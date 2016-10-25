"use strict";

/**
 * Requirements
 */
const WriteFilesTask = require(SOURCE_ROOT + '/task/WriteFilesTask.js').WriteFilesTask;
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
describe(WriteFilesTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(WriteFilesTask, 'task/WriteFilesTask', prepareParameters);

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
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/WriteFilesTask');
        fs.emptyDirSync(fixtures.path);
    });


    describe('#stream()', function()
    {
        it('should write files to the filesystem', function(cb)
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

            const testee = new WriteFilesTask(fixtures.cliLogger);
            const stream = testee.stream(sourceStream, undefined, { path: fixtures.path })
                .on('finish', () =>
                {
                    expect(fs.existsSync(pathes.concat(fixtures.path, 'test.css'))).to.be.ok;
                    cb();
                });
        });
    });
});
