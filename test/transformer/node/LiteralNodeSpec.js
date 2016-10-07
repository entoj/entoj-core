"use strict";

/**
 * Requirements
 */
const LiteralNode = require(SOURCE_ROOT + '/transformer/node/LiteralNode.js').LiteralNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(LiteralNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(LiteralNode, 'transformer.node/LiteralNode',
    {
        nodeFields: [],
        serialized:
        {
            type: LiteralNode.className,
            value: undefined
        }
    });


    /**
     * LiteralNode Test
     */
    describe('#constructor()', function()
    {
        it('should allow to populate value', function()
        {
            const testee = new LiteralNode('value');
            expect(testee.value).to.be.equal('value');
        });
    });
});
