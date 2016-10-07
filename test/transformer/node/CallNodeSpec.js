"use strict";

/**
 * Requirements
 */
const CallNode = require(SOURCE_ROOT + '/transformer/node/CallNode.js').CallNode;
const TextNode = require(SOURCE_ROOT + '/transformer/node/TextNode.js').TextNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(CallNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(CallNode, 'transformer.node/CallNode',
    {
        nodeFields: ['children', 'parameters'],
        serialized:
        {
            type: CallNode.className,
            name: undefined,
            parameters: [],
            children: []
        }
    });


    /**
     * CallNode Test
     */
    describe('#constructor()', function()
    {
        it('should allow to populate name, value and children', function()
        {
            const testee = new CallNode('name', [new TextNode()], [new TextNode()]);
            expect(testee.name).to.be.equal('name');
            expect(testee.parameters).to.have.length(1);
            expect(testee.children).to.have.length(1);
        });
    });


    describe('#serialize()', function()
    {
        it('should serialize all nodes in children', function()
        {
            const testee = new CallNode();
            const expected =
            {
                type: 'transformer.node/CallNode',
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


    describe('#clone()', function()
    {
        it('should clone all serializable properties', function()
        {
            const testee = new CallNode('name', [new TextNode()], [new TextNode()]);
            expect(testee.clone().children[0]).to.be.not.equal(testee.children[0]);
            expect(testee.clone().parameters[0]).to.be.not.equal(testee.parameters[0]);
        });
    });
});
