"use strict";

/**
 * Requirements
 */
const ParametersNode = require(SOURCE_ROOT + '/transformer/node/ParametersNode.js').ParametersNode;
const ParameterNode = require(SOURCE_ROOT + '/transformer/node/ParameterNode.js').ParameterNode;
const ExpressionNode = require(SOURCE_ROOT + '/transformer/node/ExpressionNode.js').ExpressionNode;
const LiteralNode = require(SOURCE_ROOT + '/transformer/node/LiteralNode.js').LiteralNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(ParametersNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(ParametersNode, 'transformer.node/ParametersNode',
    {
        serialized:
        {
            type: ParametersNode.className,
            children:
            [
                {
                    type: 'transformer.node/BaseNode'
                }
            ]
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push([new BaseNode()]);
        return parameters;
    }


    /**
     * ParametersNode Test
     */
    describe('#getParameter()', function()
    {
        it('should allow to find a parameter by name', function()
        {
            const param = new ParameterNode('model');
            const testee = new ParametersNode([param]);
            expect(testee.getParameter('model')).to.be.equal(param);
        });
    });
});
