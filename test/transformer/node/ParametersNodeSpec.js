"use strict";

/**
 * Requirements
 */
const ParametersNode = require(SOURCE_ROOT + '/transformer/node/ParametersNode.js').ParametersNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(ParametersNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(ParametersNode, 'transformer.node/ParametersNode',
    {
        serialized:
        {
            type: ParametersNode.className,
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
