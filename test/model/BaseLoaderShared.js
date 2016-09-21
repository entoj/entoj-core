'use strict';

/**
 * Requirements
 * @ignore
 */
let create = require(SOURCE_ROOT + '/utils/objects.js').create;


/**
 * Shared BaseLoader spec
 */
function spec(type, className, prepareParameters)
{
    let createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = createTestee();
            expect(testee.className).to.be.equal(className);
        });
    });


    describe('#load', function()
    {
        it('should return a Promise', function()
        {
            let testee = createTestee();
            let promise = testee.load();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });
    });
}

/**
 * Exports
 */
module.exports.spec = spec;
