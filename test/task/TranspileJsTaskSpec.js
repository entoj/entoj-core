"use strict";

/**
 * Requirements
 */
const TranspileJsTask = require(SOURCE_ROOT + '/task/TranspileJsTask.js').TranspileJsTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const co = require('co');
const through2 = require('through2');
const VinylFile = require('vinyl');


/**
 * Spec
 */
describe(TranspileJsTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(TranspileJsTask, 'task/TranspileJsTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * TranspileJsTask Test
     */
    beforeEach(function()
    {
        fixtures = {};
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = true;
    });


    describe('#stream()', function()
    {
        it('should transpile all streamed files', function()
        {
            const promise = co(function *()
            {
                const input = `for (const item of ["hi", "there"]) {};`;
                const sourceStream = through2(
                {
                    objectMode: true
                });
                sourceStream.write(new VinylFile(
                {
                    path: 'test.js',
                    contents: new Buffer(input)
                }));
                sourceStream.end();

                const testee = new TranspileJsTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(sourceStream));
                for (const file of data)
                {
                    expect(file.contents.toString()).to.be.ok;
                    expect(file.contents.toString()).to.be.not.equal(input);
                    expect(file.contents.toString()).to.contain('"hi"');
                    expect(file.contents.toString()).to.contain('"there"');
                }
            });
            return promise;
        });
    });
});
