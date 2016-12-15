"use strict";

/**
 * Requirements
 */
const RenameFilesTask = require(SOURCE_ROOT + '/task/RenameFilesTask.js').RenameFilesTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const through2 = require('through2');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const PATH_SEPERATOR = require('path').sep;


/**
 * Spec
 */
describe(RenameFilesTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(RenameFilesTask, 'task/RenameFilesTask', prepareParameters);

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
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/RenameFilesTask/**/*.*');
    });


    describe('#renameFile()', function()
    {
        it('should not rename any files without configuration', function()
        {
            const promise = co(function *()
            {
                const testee = new RenameFilesTask(fixtures.cliLogger);
                const file = new VinylFile(
                {
                    path: PATH_SEPERATOR + 'path' + PATH_SEPERATOR + 'to' + PATH_SEPERATOR + 'test.html',
                    contents: new Buffer('')
                });
                const resultFile = yield testee.renameFile(file);
                expect(resultFile.path).to.be.equal(file.path);
            });
            return promise;
        });

        it('should rename files based on a renameFiles regex configuration', function()
        {
            const promise = co(function *()
            {
                const testee = new RenameFilesTask(fixtures.cliLogger);
                const parameters =
                {
                    renameFiles:
                    {
                        "(.*)\.html$": "$1.txt",
                        "(.*)test\.(.*)": "$1example.$2"
                    }
                };
                const file1 = new VinylFile(
                {
                    path: PATH_SEPERATOR + 'path' + PATH_SEPERATOR + 'to' + PATH_SEPERATOR + 'test.html',
                    contents: new Buffer('')
                });
                const file2 = new VinylFile(
                {
                    path: 'test.html',
                    contents: new Buffer('')
                });
                const resultFile1 = yield testee.renameFile(file1, undefined, parameters);
                expect(resultFile1.path).to.be.equal(PATH_SEPERATOR + 'path' + PATH_SEPERATOR + 'to' + PATH_SEPERATOR + 'example.txt');
                const resultFile2 = yield testee.renameFile(file2, undefined, parameters);
                expect(resultFile2.path).to.be.equal('example.txt');
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
                const testee = new RenameFilesTask(fixtures.cliLogger);
                const parameters =
                {
                    renameFiles:
                    {
                        "(.*)entityId\.(.*)": "$1m-gallery.$2"
                    }
                };
                const data = yield baseTaskSpec.readStream(testee.stream(baseTaskSpec.filesStream(fixtures.path), undefined, parameters));
                expect(data).to.have.length(2);
                for (const file of data)
                {
                    expect(file.basename).to.be.oneOf(['overview.j2', 'm-gallery.scss']);
                }
            });
            return promise;
        });
    });
});
