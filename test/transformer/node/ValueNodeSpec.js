'use strict';

/**
 * Requirements
 */
const ValueNode = require(SOURCE_ROOT + '/transformer/node/ValueNode.js').ValueNode;
const valueNodeSpec = require(TEST_ROOT + '/transformer/node/ValueNodeShared.js');


/**
 * Spec
 */
describe(ValueNode.className, function()
{
    /**
     * ValueNode Test
     */
    valueNodeSpec(ValueNode, 'transformer.node/ValueNode',
    {
        nodeFields: [],
        values:
        {
            value: 'value'
        },
        serialized:
        {
            type: ValueNode.className,
            value: 'value'
        }
    });
});
