'use strict';

/**
 * Requirements
 */
const NodeTransformer = require(SOURCE_ROOT + '/transformer/NodeTransformer.js').NodeTransformer;
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');


/**
 * Spec
 */
describe(NodeTransformer.className, function()
{
    nodeTransformerSpec(NodeTransformer, 'transformer/NodeTransformer');
});
