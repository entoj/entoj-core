"use strict";

/**
 * Requirements
 */
const IfNode = require(SOURCE_ROOT + '/transformer/node/IfNode.js').IfNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(IfNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(IfNode, 'transformer.node/IfNode',
    {
        serialized:
        {
            type: IfNode.className,
            condition:
            {
                type: 'transformer.node/BaseNode'
            },
            elseChildren:
            [
                {
                    type: 'transformer.node/BaseNode'
                }
            ],
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
        parameters.push(new BaseNode());
        parameters.push([new BaseNode()]);
        parameters.push([new BaseNode()]);
        return parameters;
    }
});
