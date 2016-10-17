"use strict";

/**
 * Requirements
 */
const VariableNode = require(SOURCE_ROOT + '/transformer/node/VariableNode.js').VariableNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(VariableNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(VariableNode, 'transformer.node/VariableNode',
    {
        serialized:
        {
            type: VariableNode.className,
            fields: ['item']
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push(['item']);
        return parameters;
    }
});
