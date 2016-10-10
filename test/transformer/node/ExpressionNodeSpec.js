"use strict";

/**
 * Requirements
 */
const ExpressionNode = require(SOURCE_ROOT + '/transformer/node/ExpressionNode.js').ExpressionNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(ExpressionNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(ExpressionNode, 'transformer.node/ExpressionNode',
    {
        serialized:
        {
            type: ExpressionNode.className,
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
