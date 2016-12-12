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
            valueName: 'value',
            keyName: 'key',
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
        parameters.push('key');
        parameters.push('value');
        parameters.push(new BaseNode());
        parameters.push([new BaseNode()]);
        return parameters;
    }
});
