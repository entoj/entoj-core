"use strict";

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Shared ValueNode spec
 */
function spec(type, className, fixture, prepareParameters)
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(type, className, fixture, localPrepareParameters);


    function localPrepareParameters(parameters)
    {
        if (fixture.values && typeof fixture.values.value !== 'undefined')
        {
            parameters.push(fixture.values.value);
        }
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return parameters;
    }


    /**
     * ValueNode Test
     */
    const createTestee = function()
    {
        let parameters = localPrepareParameters(Array.from(arguments));
        return create(type, parameters);
    };


    if (fixture.values && typeof fixture.values.value !== 'undefined')
    {
        describe('#is()', function()
        {
            it('should allow to check the node value', function()
            {
                const testee = createTestee();
                expect(testee.is(undefined, { value: fixture.values.value })).to.be.ok;
                expect(testee.is(undefined, { value: fixture.values.value + 'foo' })).to.be.not.ok;
            });

            it('should allow to check multiple node values', function()
            {
                const testee = createTestee();
                expect(testee.is(undefined, { value: [fixture.values.value, fixture.values.value + 'foo'] })).to.be.ok;
                expect(testee.is(undefined, { value: [fixture.values.value + 'foo', fixture.values.value + 'bar'] })).to.be.not.ok;
            });
        });
    }
}

/**
 * Exports
 */
module.exports = spec;
