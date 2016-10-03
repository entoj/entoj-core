"use strict";

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseLinterSpec = require(TEST_ROOT + '/linter/BaseLinterShared.js');
const co = require('co');
const sinon = require('sinon');


/**
 * Shared FileLinter spec
 */
function spec(type, className, fixture, prepareParameters)
{
    /**
     * BaseLinter Test
     */
    baseLinterSpec(type, className, fixture);

    /**
     * FileLinter Test
     */
    const createTestee = function()
    {
        const parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    describe('#constructor', function()
    {
        it('should allow to configure glob via options', function()
        {
            const testee = createTestee({}, { glob: fixture.glob });
            expect(testee.glob).to.be.contain(fixture.glob[0]);
        });
    });


    describe('#lint', function()
    {
        it('should resolve to an object containing all parsed files', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee({}, { glob: fixture.glob });
                const result = yield testee.lint(fixture.root);
                expect(result).to.be.ok;
                expect(result.files).to.have.length(fixture.globCount);
            });
            return promise;
        });

        it('should lint each file that is matched by the given glob and root path', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                sinon.spy(testee, 'lintFile');
                const result = yield testee.lint(fixture.root, { glob: fixture.glob });
                expect(testee.lintFile.called).to.be.ok;
            });
            return promise;
        });
    });
}

/**
 * Exports
 */
module.exports = spec;
