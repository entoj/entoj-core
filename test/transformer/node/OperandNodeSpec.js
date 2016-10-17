"use strict";

/**
 * Requirements
 */
const OperandNode = require(SOURCE_ROOT + '/transformer/node/OperandNode.js').OperandNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(OperandNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(OperandNode, 'transformer.node/OperandNode',
    {
        serialized:
        {
            type: OperandNode.className,
            value: 'value'
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('value');
        return parameters;
    }
});
