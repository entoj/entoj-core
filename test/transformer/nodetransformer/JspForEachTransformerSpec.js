'use strict';

/**
 * Requirements
 */
const JspForEachTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspForEachTransformer.js').JspForEachTransformer;
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');


/**
 * Spec
 */
describe(JspForEachTransformer.className, function()
{
    /**
     * NodeTransformer Test
     */
    nodeTransformerSpec(JspForEachTransformer, 'transformer/nodetransformer/JspForEachTransformer');


    /**
     * JspForEachTransformer Test
     */
    describe('#transform()', function()
    {
        it('should replace loop status var', function()
        {
            return nodeTransformerSpec.testFixture('JspForEachTransformer', JspForEachTransformer);
        });
    });
});
