"use strict";

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Shared BaseFormatter spec
 */
function spec(type, className, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className, prepareParameters);


    /**
     * BaseFormatter Test
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


    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#format', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.format();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });
    });
}

/**
 * Exports
 */
module.exports = spec;
