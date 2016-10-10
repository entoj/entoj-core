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


    describe('#isNode()', function()
    {
        it('should allow to check the node type', function()
        {
            const testee = createTestee();
            expect(testee.isNode(testee.type)).to.be.ok;
        });
    });


    describe('#serialize()', function()
    {
        it('should return a object', function()
        {
            const testee = createTestee();
            expect(testee.serialize()).to.be.instanceof(Object);
        });

        if (fixture && fixture.serialized)
        {
            it('should return a serialized representation', function()
            {
                const testee = createTestee();
                //console.log(JSON.stringify(testee.serialize(), null, 4));
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

        it('should return a object with the same structure', function()
        {
            const testee = createTestee();
            expect(testee.clone().serialize()).to.be.deep.equal(testee.serialize());
        });

        it('should return a object where all child objects are cloned', function()
        {
            const testee = createTestee();
            expect(testee).to.be.not.deep.equal(testee.serialize());
        });
    });
}

/**
 * Exports
 */
module.exports = spec;
