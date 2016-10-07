"use strict";

/**
 * Requirements
 */
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const NodeList = require(SOURCE_ROOT + '/transformer/node/NodeList.js').NodeList;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(NodeList.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(NodeList, 'transformer.node/NodeList',
    {
        nodeFields: ['children'],
        serialized:
        {
            type: NodeList.className,
            children: []
        }
    });


    /**
     * NodeList Test
     */
    describe('#constructor()', function()
    {
        it('should allow to populate children', function()
        {
            const testee = new NodeList([new BaseNode()]);
            expect(testee.children).to.have.length(1);
        });
    });


    describe('#serialize()', function()
    {
        it('should serialize all nodes in children', function()
        {
            const testee = new NodeList();
            const expected =
            {
                type: 'transformer.node/NodeList',
                children:
                [
                    {
                        type: 'transformer.node/BaseNode'
                    }
                ]
            };
            testee.children.push(new BaseNode());
            expect(testee.serialize()).to.be.deep.equal(expected);
        });
    });
});
