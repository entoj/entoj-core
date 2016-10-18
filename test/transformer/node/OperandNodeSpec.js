'use strict';

/**
 * Requirements
 */
const OperandNode = require(SOURCE_ROOT + '/transformer/node/OperandNode.js').OperandNode;
const valueNodeSpec = require(TEST_ROOT + '/transformer/node/ValueNodeShared.js');


/**
 * Spec
 */
describe(OperandNode.className, function()
{
    /**
     * ValueNode Test
     */
    valueNodeSpec(OperandNode, 'transformer.node/OperandNode',
    {
        nodeFields: [],
        values:
        {
            value: '+'
        },
        serialized:
        {
            type: OperandNode.className,
            value: '+'
        }
    });
});
