'use strict';

/**
 * Requirements
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Shared Renderer spec
 */
function spec(type, className, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className);


    /**
     * BaseRenderer Test
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


    describe('#render()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.render();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });
    });
};

/**
 * Exports
 */
module.exports = spec;
