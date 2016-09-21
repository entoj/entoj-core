"use strict";

/**
 * Requirements
 */
const Runner = require(SOURCE_ROOT + '/application/Runner.js').Runner;
const Context = require(SOURCE_ROOT + '/application/Context.js').Context;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const sinon = require('sinon');


/**
 * Spec
 */
describe(Runner.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.context = new Context(fixtures.configuration);
        fixtures.cliLogger = new CliLogger(undefined, { muted: true });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new Runner(fixtures.context, fixtures.cliLogger);
            expect(testee.className).to.be.equal('application/Runner');
        });
    });


    describe('#constructor', function()
    {
        it('should allow to configure commands', function()
        {
            let testee = new Runner(fixtures.context, fixtures.cliLogger, fixtures.configuration.commands);

            expect(testee.commands).to.have.length(5);
            expect(testee.commands.find(command => command instanceof fixtures.configuration.commands[0].type)).to.be.ok;
            expect(testee.commands.find(command => command instanceof fixtures.configuration.commands[1].type)).to.be.ok;
            expect(testee.commands.find(command => command instanceof fixtures.configuration.commands[2])).to.be.ok;
            expect(testee.commands.find(command => command instanceof fixtures.configuration.commands[3])).to.be.ok;
            expect(testee.commands.find(command => command instanceof fixtures.configuration.commands[4].type)).to.be.ok;
        });
    });


    describe('#run', function()
    {
        it('should give each command the opportunity to execute', function()
        {
            let testee = new Runner(fixtures.context, fixtures.cliLogger, fixtures.configuration.commands);
            sinon.spy(testee.commands[0], 'execute');
            let promise = testee.run([]).then(function()
            {
                expect(testee.commands[0].execute.calledOnce).to.be.ok;
            });
            return promise;
        });
    });
});
