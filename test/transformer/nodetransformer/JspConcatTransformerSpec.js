'use strict';

/**
 * Requirements
 */
const JspConcatTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspConcatTransformer.js').JspConcatTransformer;
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');


/**
 * Spec
 */
describe(JspConcatTransformer.className, function()
{
    /**
     * NodeTransformer Test
     */
    nodeTransformerSpec(JspConcatTransformer, 'transformer/nodetransformer/JspConcatTransformer');


    /**
     * JspConcatTransformer Test
     */
    describe('#transform()', function()
    {
        it('should replace string concatenation via "+" with "+="', function()
        {
            return nodeTransformerSpec.testFixture('JspConcatTransformer', JspConcatTransformer);
        });
    });
});
