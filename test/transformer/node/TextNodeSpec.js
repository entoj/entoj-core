'use strict';

/**
 * Requirements
 */
const TextNode = require(SOURCE_ROOT + '/transformer/node/TextNode.js').TextNode;
const valueNodeSpec = require(TEST_ROOT + '/transformer/node/ValueNodeShared.js');


/**
 * Spec
 */
describe(TextNode.className, function()
{
    /**
     * ValueNode Test
     */
    valueNodeSpec(TextNode, 'transformer.node/TextNode',
    {
        nodeFields: [],
        values:
        {
            value: 'Lorem Ipsum'
        },
        serialized:
        {
            type: TextNode.className,
            value: 'Lorem Ipsum'
        }
    });
});
