'use strict';

/**
 * Requirements
 */
const JspDecorateVariablesTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspDecorateVariablesTransformer.js').JspDecorateVariablesTransformer;
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');


/**
 * Spec
 */
describe(JspDecorateVariablesTransformer.className, function()
{
    /**
     * NodeTransformer Test
     */
    nodeTransformerSpec(JspDecorateVariablesTransformer, 'transformer/nodetransformer/JspDecorateVariablesTransformer');


    /**
     * JspRenameVariablesTransformer Test
     */
    describe('#transform()', function()
    {
        it('should decorate ', function()
        {
            return nodeTransformerSpec.testFixture('JspDecorateVariablesTransformer',
                JspDecorateVariablesTransformer,
                undefined,
                {
                    prefix: 'pre_',
                    suffix: '_suf',
                    filter: (name) => name !== 'keep'
                });
        });
    });
});
