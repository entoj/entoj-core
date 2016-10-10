"use strict";

/**
 * Requirements
 */
const ForNode = require(SOURCE_ROOT + '/transformer/node/ForNode.js').ForNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(ForNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(ForNode, 'transformer.node/ForNode',
    {
        serialized:
        {
            type: ForNode.className,
            name: 'item',
            value:
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
        parameters.push('item');
        parameters.push(new BaseNode());
        parameters.push([new BaseNode()]);
        return parameters;
    }
});
