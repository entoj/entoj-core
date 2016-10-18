'use strict';

/**
 * Requirements
 */
const BooleanOperandNode = require(SOURCE_ROOT + '/transformer/node/BooleanOperandNode.js').BooleanOperandNode;
const valueNodeSpec = require(TEST_ROOT + '/transformer/node/ValueNodeShared.js');


/**
 * Spec
 */
describe(BooleanOperandNode.className, function()
{
    /**
     * ValueNode Test
     */
    valueNodeSpec(BooleanOperandNode, 'transformer.node/BooleanOperandNode',
    {
        nodeFields: [],
        values:
        {
            value: 'and'
        },
        serialized:
        {
            type: BooleanOperandNode.className,
            value: 'and'
        }
    });
});
