"use strict";

/**
 * Requirements
 */
const BooleanOperandNode = require(SOURCE_ROOT + '/transformer/node/BooleanOperandNode.js').BooleanOperandNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(BooleanOperandNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(BooleanOperandNode, 'transformer.node/BooleanOperandNode',
    {
        serialized:
        {
            type: BooleanOperandNode.className,
            value: 'value'
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('value');
        return parameters;
    }
});
