"use strict";

/**
 * Requirements
 */
const RemoveFilesTask = require(SOURCE_ROOT + '/task/RemoveFilesTask.js').RemoveFilesTask;
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
describe(RemoveFilesTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(RemoveFilesTask, 'task/RemoveFilesTask', prepareParameters);

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
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/RemoveFilesTask/**/*.*');
    });


    describe('#removeFile()', function()
    {
        it('should not remove any files without configuration', function()
        {
            const promise = co(function *()
            {
                const testee = new RemoveFilesTask(fixtures.cliLogger);
                const file = new VinylFile(
                {
                    path: '/path/to/test.html',
                    contents: new Buffer('')
                });
                const resultFile = yield testee.removeFile(file);
                expect(resultFile.path).to.be.ok;
            });
            return promise;
        });

        it('should remove files based on a removeFiles regex configuration', function()
        {
            const promise = co(function *()
            {
                const testee = new RemoveFilesTask(fixtures.cliLogger);
                const parameters =
                {
                    removeFiles:
                    [
                        "(.*)\.html$"
                    ]
                };
                const file1 = new VinylFile(
                {
                    path: '/path/to/test.html',
                    contents: new Buffer('')
                });
                const file2 = new VinylFile(
                {
                    path: 'test.j2',
                    contents: new Buffer('')
                });
                const resultFile1 = yield testee.removeFile(file1, undefined, parameters);
                expect(resultFile1).to.be.not.ok;
                const resultFile2 = yield testee.removeFile(file2, undefined, parameters);
                expect(resultFile2).to.be.ok;
            });
            return promise;
        });
    });


    describe('#stream()', function()
    {
        it('should rename files', function()
        {
            const promise = co(function *()
            {
                const testee = new RemoveFilesTask(fixtures.cliLogger);
                const parameters =
                {
                    removeFiles:
                    [
                        "(.*)\.scss$"
                    ]
                };
                const data = yield baseTaskSpec.readStream(testee.stream(baseTaskSpec.filesStream(fixtures.path), undefined, parameters));
                expect(data).to.have.length(1);
                for (const file of data)
                {
                    expect(file.basename).to.be.oneOf(['overview.j2']);
                }
            });
            return promise;
        });
    });
});
