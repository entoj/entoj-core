'use strict';

/**
 * Requirements
 */
const JspEmptyTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspEmptyTransformer.js').JspEmptyTransformer;
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');


/**
 * Spec
 */
describe(JspEmptyTransformer.className, function()
{
    /**
     * NodeTransformer Test
     */
    nodeTransformerSpec(JspEmptyTransformer, 'transformer/nodetransformer/JspEmptyTransformer');


    /**
     * JspEmptyTransformer Test
     */
    describe('#transform()', function()
    {
        it('should replace comparisons to falsy values with empty/notempty', function()
        {
            return nodeTransformerSpec.testFixture('JspEmptyTransformer', JspEmptyTransformer);
        });
    });
});
