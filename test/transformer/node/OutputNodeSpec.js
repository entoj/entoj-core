"use strict";

/**
 * Requirements
 */
const OutputNode = require(SOURCE_ROOT + '/transformer/node/OutputNode.js').OutputNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(OutputNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(OutputNode, 'transformer.node/OutputNode',
    {
        serialized:
        {
            type: OutputNode.className,
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
