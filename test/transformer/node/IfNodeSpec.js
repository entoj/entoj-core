"use strict";

/**
 * Requirements
 */
const IfNode = require(SOURCE_ROOT + '/transformer/node/IfNode.js').IfNode;
const TextNode = require(SOURCE_ROOT + '/transformer/node/TextNode.js').TextNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(IfNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(IfNode, 'transformer.node/IfNode',
    {
        nodeFields: ['children', 'condition'],
        serialized:
        {
            type: IfNode.className,
            condition: undefined,
            children: []
        }
    });


    /**
     * IfNode Test
     */
    describe('#constructor()', function()
    {
        it('should allow to populate condition and children', function()
        {
            const testee = new IfNode(new TextNode(), [new TextNode()]);
            expect(testee.condition).to.be.instanceOf(TextNode);
            expect(testee.children).to.have.length(1);
        });
    });


    describe('#serialize()', function()
    {
        it('should serialize all nodes in children', function()
        {
            const testee = new IfNode();
            const expected =
            {
                type: 'transformer.node/IfNode',
                condition: undefined,
                children:
                [
                    {
                        type: 'transformer.node/TextNode',
                        value: undefined
                    }
                ]
            };
            testee.children.push(new TextNode());
            expect(testee.serialize()).to.be.deep.equal(expected);
        });
    });
});
