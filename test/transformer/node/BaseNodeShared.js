"use strict";

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Shared BaseNode spec
 */
function spec(type, className, fixture, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className);

    /**
     * BaseNode Test
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


    describe('#nodeFields', function()
    {
        it('should return a array', function()
        {
            const testee = createTestee();
            expect(testee.nodeFields).to.be.instanceof(Array);
        });

        if (fixture && fixture.nodeFields)
        {
            it('should return [' + fixture.nodeFields.join(', ') + ']', function()
            {
                const testee = createTestee();
                expect(testee.nodeFields).to.be.deep.equal(fixture.nodeFields);
            });
        }
    });


    describe('#serialize()', function()
    {
        it('should return a object', function()
        {
            const testee = createTestee();
            expect(testee.nodeFields).to.be.instanceof(Object);
        });

        if (fixture && fixture.serialized)
        {
            it('should return a serialized representation', function()
            {
                const testee = createTestee();
                expect(testee.serialize()).to.be.deep.equal(fixture.serialized);
            });
        }
    });


    describe('#clone()', function()
    {
        it('should return a new object', function()
        {
            const testee = createTestee();
            expect(testee.clone()).to.be.instanceof(type);
            expect(testee.clone()).to.be.not.equal(testee);
        });
    });
}

/**
 * Exports
 */
module.exports = spec;
