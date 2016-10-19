'use strict';

/**
 * Requirements
 */
const JspSelfTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspSelfTransformer.js').JspSelfTransformer;
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');


/**
 * Spec
 */
describe(JspSelfTransformer.className, function()
{
    /**
     * NodeTransformer Test
     */
    nodeTransformerSpec(JspSelfTransformer, 'transformer/nodetransformer/JspSelfTransformer');


    /**
     * JspSelfTransformer Test
     */
    describe('#transform()', function()
    {
        it('should change all references to model to self', function()
        {
            return nodeTransformerSpec.testFixture('JspSelfTransformer', JspSelfTransformer);
        });
    });
});
