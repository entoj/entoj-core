"use strict";

/**
 * Requirements
 */
const SetNode = require(SOURCE_ROOT + '/transformer/node/SetNode.js').SetNode;
const TextNode = require(SOURCE_ROOT + '/transformer/node/TextNode.js').TextNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(SetNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(SetNode, 'transformer.node/SetNode',
    {
        nodeFields: ['variable', 'value'],
        serialized:
        {
            type: SetNode.className,
            variable: undefined,
            value: undefined
        }
    });


    /**
     * SetNode Test
     */
    describe('#constructor()', function()
    {
        it('should allow to populate variable and value', function()
        {
            const testee = new SetNode(new TextNode(), new TextNode());
            expect(testee.variable).to.be.instanceOf(TextNode);
            expect(testee.value).to.be.instanceOf(TextNode);
        });
    });


    describe('#serialize()', function()
    {
        it('should serialize all nodes in children', function()
        {
            const testee = new SetNode(new TextNode(), new TextNode());
            const expected =
            {
                type: 'transformer.node/SetNode',
                variable:
                {
                    type: 'transformer.node/TextNode',
                    value: undefined
                },
                value:
                {
                    type: 'transformer.node/TextNode',
                    value: undefined
                }
            };
            expect(testee.serialize()).to.be.deep.equal(expected);
        });
    });
});
