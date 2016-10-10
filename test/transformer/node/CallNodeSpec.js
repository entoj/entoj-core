"use strict";

/**
 * Requirements
 */
const CallNode = require(SOURCE_ROOT + '/transformer/node/CallNode.js').CallNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(CallNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(CallNode, 'transformer.node/CallNode',
    {
        serialized:
        {
            type: CallNode.className,
            name: 'macro_name',
            parameters:
            {
                type: 'transformer.node/BaseNode'
            },
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
        parameters.push('macro_name');
        parameters.push(new BaseNode());
        parameters.push([new BaseNode()]);
        return parameters;
    }
});
