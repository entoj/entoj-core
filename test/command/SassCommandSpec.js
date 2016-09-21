"use strict";

/**
 * Requirements
 */
let SassCommand = require(SOURCE_ROOT + '/command/SassCommand.js').SassCommand;
let Context = require(SOURCE_ROOT + '/application/Context.js').Context;
let CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
let compact = require(FIXTURES_ROOT + '/Application/Compact.js');
let gulp = require('gulp');

/**
 * Spec
 */
describe(SassCommand.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.context = new Context(fixtures.configuration);
        fixtures.cliLogger = new CliLogger('', { muted: true });

        //Map cliWriter for gulp task
        fixtures.context.di.map(CliLogger, fixtures.cliLogger);
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new SassCommand(fixtures.context);
            expect(testee.className).to.be.equal('command/SassCommand');
        });
    });


    describe('#execute', function()
    {
        xit('should execute a gulp task', function()
        {
            let startedTask;
            gulp.on('task_start', function(task)
            {
                startedTask = task;
                console.log(task);
            });
            let testee = new SassCommand(fixtures.context);
            let promise = testee.execute({ command: 'sass' }).then(function()
            {
                expect(startedTask.task).to.be.equal('sass.compile');
            });
            return promise;
        });
    });
});
