'use strict';

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Shared BaseLoader spec
 */
function spec(type, className, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className, prepareParameters);


    /**
     * BaseLoader Test
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


    describe('#load', function()
    {
        it('should return a Promise', function()
        {
            const testee = createTestee();
            const promise = testee.load();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });
    });
}

/**
 * Exports
 */
module.exports = spec;
module.exports.spec = spec;
