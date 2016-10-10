"use strict";

/**
 * Requirements
 */
const TextNode = require(SOURCE_ROOT + '/transformer/node/TextNode.js').TextNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(TextNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(TextNode, 'transformer.node/TextNode',
    {
        nodeFields: [],
        serialized:
        {
            type: TextNode.className,
            value: 'text'
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('text');
        return parameters;
    }
});
