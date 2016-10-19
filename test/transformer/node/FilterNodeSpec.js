"use strict";

/**
 * Requirements
 */
const FilterNode = require(SOURCE_ROOT + '/transformer/node/FilterNode.js').FilterNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(FilterNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(FilterNode, 'transformer.node/FilterNode',
    {
        serialized:
        {
            type: FilterNode.className,
            name: 'filter',
            parameters:
            {
                type: 'transformer.node/BaseNode'
            },
            value:
            {
                type: 'transformer.node/BaseNode'
            }
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('filter');
        parameters.push(new BaseNode());
        parameters.push(new BaseNode());
        return parameters;
    }

    /**
     * FilterNode Test
     */
    describe('#is()', function()
    {
        it('should allow to check the filter name', function()
        {
            const testee1 = new FilterNode('concat');
            const testee2 = new FilterNode('markup');
            expect(testee1.is(undefined, { name: 'concat' })).to.be.ok;
            expect(testee1.is(undefined, { name: 'markup' })).to.be.not.ok;
            expect(testee2.is(undefined, { name: 'concat' })).to.be.not.ok;
            expect(testee2.is(undefined, { name: 'markup' })).to.be.ok;
        });
    });
});
