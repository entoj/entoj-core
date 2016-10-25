"use strict";

/**
 * Requirements
 */
const BeautifyHtmlTask = require(SOURCE_ROOT + '/task/BeautifyHtmlTask.js').BeautifyHtmlTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const co = require('co');
const through2 = require('through2');
const VinylFile = require('vinyl');


/**
 * Spec
 */
describe(BeautifyHtmlTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(BeautifyHtmlTask, 'task/BeautifyHtmlTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * BeautifyHtmlTask Test
     */
    beforeEach(function()
    {
        fixtures = {};
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = true;
    });


    describe('#stream()', function()
    {
        it('should beautify all streamed files', function()
        {
            const promise = co(function *()
            {
                const sourceStream = through2(
                {
                    objectMode: true
                });
                sourceStream.write(new VinylFile(
                {
                    path: 'test.html',
                    contents: new Buffer('<div><div><span>Hi</span></div></div>')
                }));
                sourceStream.end();

                const testee = new BeautifyHtmlTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(sourceStream));
                for (const file of data)
                {
                    expect(file.contents.toString()).to.be.equal('<div>\n    <div>\n        <span>\n            Hi</span>\n    </div>\n</div>');
                }
            });
            return promise;
        });
    });
});
