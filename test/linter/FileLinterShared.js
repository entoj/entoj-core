"use strict";

/**
 * Requirements
 * @ignore
 */
let create = require(SOURCE_ROOT + '/utils/objects.js').create;
let co = require('co');
let sinon = require('sinon');

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
        describe('#constructor', function()
        {
            it('should allow to configure glob via options', function()
            {
                let testee = createTestee(fixtures, [{}, { glob:fixtures.glob }]);
                expect(testee.glob).to.be.contain(fixtures.glob[0]);
            });
        });


        describe('#className', function()
        {
            it('should return the namespaced class name', function()
            {
                let testee = createTestee(fixtures);
                expect(testee.className).to.be.equal(className);
            });
        });


        describe('#lint', function()
        {
            it('should resolve to an object with a success flag and the linting results', function()
            {
                let testee = createTestee(fixtures);
                let promise = testee.lint(fixtures.root).then(function(result)
                {
                    expect(result.success).to.exist;
                    expect(result.errorCount).to.exist;
                    expect(result.warningCount).to.exist;
                    expect(result.messages).to.exist;
                    expect(result.files).to.exist;
                });
                return promise;
            });


            it('should resolve to an object containing all parsed files', function()
            {
                let promise = co(function*()
                {
                    let testee = createTestee(fixtures, [{}, { glob: fixtures.glob }]);
                    let result = yield testee.lint(fixtures.root);
                    expect(result).to.be.ok;
                    expect(result.files).to.have.length(fixtures.globCount);
                });
                return promise;
            });


            it('should apply no rules per default', function()
            {
                let testee = createTestee(fixtures);
                let promise = testee.lint(fixtures.root).then(function(result)
                {
                    expect(result.success).to.be.ok;
                    expect(result.errorCount).to.equal(0);
                    expect(result.warningCount).to.equal(0);
                    expect(result.messages).to.have.length(0);
                });
                return promise;
            });


            it('should lint each file that is matched by the given glob and root path', function()
            {
                let promise = co(function*()
                {
                    let testee = createTestee(fixtures);
                    sinon.spy(testee, 'lintFile');
                    let result = yield testee.lint(fixtures.root, { glob: fixtures.glob });
                    expect(testee.lintFile.called).to.be.ok;
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
