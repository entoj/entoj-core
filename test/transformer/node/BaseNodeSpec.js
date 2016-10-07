"use strict";

/**
 * Requirements
 */
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(BaseNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(BaseNode, 'transformer.node/BaseNode',
    {
        nodeFields: [],
        serialized:
        {
            type: BaseNode.className
        }
    });
});
