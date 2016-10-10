"use strict";

/**
 * Requirements
 */
const ConditionNode = require(SOURCE_ROOT + '/transformer/node/ConditionNode.js').ConditionNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(ConditionNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(ConditionNode, 'transformer.node/ConditionNode',
    {
        serialized:
        {
            type: ConditionNode.className,
            children:
            [
                {
                    type: 'transformer.node/BaseNode'
                }
            ]
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push([new BaseNode()]);
        return parameters;
    }
});
