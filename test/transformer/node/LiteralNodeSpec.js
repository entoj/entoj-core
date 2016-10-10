"use strict";

/**
 * Requirements
 */
const LiteralNode = require(SOURCE_ROOT + '/transformer/node/LiteralNode.js').LiteralNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(LiteralNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(LiteralNode, 'transformer.node/LiteralNode',
    {
        nodeFields: [],
        serialized:
        {
            type: LiteralNode.className,
            value: 'value'
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('value');
        return parameters;
    }
});
