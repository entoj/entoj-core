"use strict";

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;

/**
 * Shared Linter spec
 */
function spec(type, className, specs, instanciator)
{
    let createTestee = function(fixture, parameters)
    {
        if (instanciator)
        {
            return instanciator(type, fixture);
        }
        return create(type, parameters);
    };

    return function()
    {
        describe('#className', function()
        {
            it('should return the namespaced class name', function()
            {
                const testee = createTestee(fixtures);
                expect(testee.className).to.be.equal(className);
            });
        });


        describe('#lint()', function()
        {
            it('should resolve to an object with a success flag and the linting results', function()
            {
                const testee = createTestee(fixtures);
                const promise = testee.lint(fixtures.source).then(function(result)
                {
                    expect(result.success).to.exist;
                    expect(result.errorCount).to.exist;
                    expect(result.warningCount).to.exist;
                    expect(result.messages).to.exist;
                });
                return promise;
            });


            it('should apply no rules per default', function()
            {
                const testee = createTestee(fixtures);
                const promise = testee.lint(fixtures.source).then(function(result)
                {
                    expect(result.success).to.be.ok;
                    expect(result.errorCount).to.equal(0);
                    expect(result.warningCount).to.equal(0);
                    expect(result.messages).to.have.length(0);
                });
                return promise;
            });


            it('should apply the rules configured via the constructor', function()
            {
                const testee = createTestee(fixtures, [fixtures.warningRules]);
                const promise = testee.lint(fixtures.source).then(function(result)
                {
                    expect(result.success).to.be.false;
                    expect(result.errorCount).to.be.equal(0);
                    expect(result.warningCount).to.be.above(0);
                    expect(result.messages.length).to.be.above(0);
                });
                return promise;
            });


            it('should allow to specify a filename via options', function()
            {
                const testee = createTestee(fixtures, [fixtures.warningRules]);
                const promise = testee.lint(fixtures.source, { filename: 'filename.ext' }).then(function(result)
                {
                    expect(result.messages.length).to.be.above(0);
                    expect(result.messages[0].filename).to.be.equal('filename.ext');
                });
                return promise;
            });


            it('should add the linter type to each message', function()
            {
                const testee = createTestee(fixtures, [fixtures.warningRules]);
                const promise = testee.lint(fixtures.source).then(function(result)
                {
                    expect(result.messages.length).to.be.above(0);
                    expect(result.messages[0].linter).to.be.equal(className);
                });
                return promise;
            });
        });


        if (specs)
        {
            specs();
        }
    };
}

/**
 * Exports
 */
module.exports.spec = spec;
