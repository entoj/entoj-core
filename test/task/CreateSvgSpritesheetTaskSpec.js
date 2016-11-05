"use strict";

/**
 * Requirements
 */
const CreateSvgSpritesheetTask = require(SOURCE_ROOT + '/task/CreateSvgSpritesheetTask.js').CreateSvgSpritesheetTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const gulp = require('gulp');
const through2 = require('through2');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const sinon = require('sinon');



/**
 * Spec
 */
describe(CreateSvgSpritesheetTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(CreateSvgSpritesheetTask, 'task/CreateSvgSpritesheetTask', prepareParameters, { skipDelegateTest: true });

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * CreateSvgSpritesheetTask Test
     */
    beforeEach(function()
    {
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = true;
        fixtures.pathInput = pathes.concat(FIXTURES_ROOT, '/Tasks/CreateSvgSpritesheetTask/input/*.svg');
        fixtures.pathOutput = pathes.concat(FIXTURES_ROOT, '/Tasks/CreateSvgSpritesheetTask/output');
        fs.emptyDirSync(fixtures.pathOutput);
    });


    describe('#stream()', function()
    {
        it('should generate a svg sprite', function()
        {
            const promise = co(function *()
            {
                const sourceStream = gulp.src(fixtures.pathInput);
                const testee = new CreateSvgSpritesheetTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(sourceStream));
                for (const file of data)
                {
                    expect(file.contents.toString()).to.contain('id="arrow-right"');
                    expect(file.contents.toString()).to.contain('id="contact"');
                    expect(file.contents.toString()).to.contain('id="youtube"');
                }
            }).catch((e) => console.log(e));
            return promise;
        });
    });
});
