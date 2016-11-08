'use strict';

/**
 * Requirements
 */
const JspStaticModelTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspStaticModelTransformer.js').JspStaticModelTransformer;
const ViewModelRepository = require(SOURCE_ROOT + '/model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');


/**
 * Spec
 */
describe(JspStaticModelTransformer.className, function()
{
    /**
     * NodeTransformer Test
     */
    nodeTransformerSpec(JspStaticModelTransformer, 'transformer/nodetransformer/JspStaticModelTransformer', prepareParameters);

    function prepareParameters(parameters)
    {
        parameters.push(fixtures.viewModelRepository);
        return parameters;
    }


    /**
     * JspStaticModelTransformer Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.viewModelRepository = fixtures.context.di.create(ViewModelRepository);
    });


    describe('#transform()', function()
    {
        it('should prepend all static models in macro calls with loadJson', function()
        {
            return nodeTransformerSpec.testFixture('JspStaticModelTransformer', JspStaticModelTransformer, prepareParameters);
        });
    });
});
