"use strict";

/**
 * Requirements
 */
const YieldNode = require(SOURCE_ROOT + '/transformer/node/YieldNode.js').YieldNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(YieldNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(YieldNode, 'transformer.node/YieldNode',
    {
        serialized:
        {
            type: YieldNode.className
        }
    });
});
