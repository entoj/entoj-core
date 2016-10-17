"use strict";

/**
 * Requirements
 */
const ParameterNode = require(SOURCE_ROOT + '/transformer/node/ParameterNode.js').ParameterNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(ParameterNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(ParameterNode, 'transformer.node/ParameterNode',
    {
        serialized:
        {
            type: ParameterNode.className,
            name: 'item',
            value:
            {
                type: 'transformer.node/BaseNode'
            }
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('item');
        parameters.push(new BaseNode());
        return parameters;
    }
});
