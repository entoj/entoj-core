"use strict";

/**
 * Requirements
 */
const MacroNode = require(SOURCE_ROOT + '/transformer/node/MacroNode.js').MacroNode;
const TextNode = require(SOURCE_ROOT + '/transformer/node/TextNode.js').TextNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(MacroNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(MacroNode, 'transformer.node/MacroNode',
    {
        nodeFields: ['children', 'parameters'],
        serialized:
        {
            type: MacroNode.className,
            name: undefined,
            parameters: [],
            children: []
        }
    });


    /**
     * MacroNode Test
     */
    describe('#constructor()', function()
    {
        it('should allow to populate name, value and children', function()
        {
            const testee = new MacroNode('name', [new TextNode()], [new TextNode()]);
            expect(testee.name).to.be.equal('name');
            expect(testee.parameters).to.have.length(1);
            expect(testee.children).to.have.length(1);
        });
    });


    describe('#serialize()', function()
    {
        it('should serialize all nodes in children', function()
        {
            const testee = new MacroNode();
            const expected =
            {
                type: 'transformer.node/MacroNode',
                name: undefined,
                parameters: [],
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
