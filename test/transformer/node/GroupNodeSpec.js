"use strict";

/**
 * Requirements
 */
const GroupNode = require(SOURCE_ROOT + '/transformer/node/GroupNode.js').GroupNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(GroupNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(GroupNode, 'transformer.node/GroupNode',
    {
        serialized:
        {
            type: GroupNode.className,
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
