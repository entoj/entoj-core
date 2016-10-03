"use strict";

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Shared Linter spec
 */
function spec(type, className, fixture, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className);

    /**
     * Linter Test
     */
    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };

    describe('#lint()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.lint();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to an object with a success flag and the linting results', function()
        {
            const testee = createTestee();
            const promise = testee.lint().then(function(result)
            {
                expect(result.success).to.exist;
                expect(result.errorCount).to.exist;
                expect(result.warningCount).to.exist;
                expect(result.messages).to.exist;
            });
            return promise;
        });

        if (fixture && fixture.source)
        {
            it('should apply no rules per default', function()
            {
                const testee = createTestee();
                const promise = testee.lint(fixture.source).then(function(result)
                {
                    expect(result.success).to.be.ok;
                    expect(result.errorCount).to.equal(0);
                    expect(result.warningCount).to.equal(0);
                    expect(result.messages).to.have.length(0);
                });
                return promise;
            });
        }

        if (fixture && fixture.source && fixture.warningRules)
        {
            it('should apply the rules configured via the constructor', function()
            {
                const testee = createTestee(fixture.warningRules);
                const promise = testee.lint(fixture.source).then(function(result)
                {
                    expect(result.success).to.be.false;
                    expect(result.errorCount).to.be.equal(0);
                    expect(result.warningCount).to.be.equal(fixture.warningCount);
                    expect(result.messages.length).to.be.equal(fixture.warningCount);
                });
                return promise;
            });


            it('should allow to specify a filename via options', function()
            {
                const testee = createTestee(fixture.warningRules);
                const promise = testee.lint(fixture.source, { filename: 'filename.ext' }).then(function(result)
                {
                    expect(result.messages.length).to.be.above(0);
                    expect(result.messages[0].filename).to.be.equal('filename.ext');
                });
                return promise;
            });


            it('should add the linter type to each message', function()
            {
                const testee = createTestee(fixture.warningRules);
                const promise = testee.lint(fixture.source).then(function(result)
                {
                    expect(result.messages.length).to.be.above(0);
                    expect(result.messages[0].linter).to.be.equal(fixture.linterClassName || className);
                });
                return promise;
            });
        }
    });
}

/**
 * Exports
 */
module.exports = spec;
