"use strict";

/**
 * Requirements
 */
const SetNode = require(SOURCE_ROOT + '/transformer/node/SetNode.js').SetNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(SetNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(SetNode, 'transformer.node/SetNode',
    {
        nodeFields: ['variable', 'value'],
        serialized:
        {
            type: SetNode.className,
            variable: 'variable',
            value:
            {
                type: 'transformer.node/BaseNode'
            }
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('variable');
        parameters.push(new BaseNode());
        return parameters;
    }
});
