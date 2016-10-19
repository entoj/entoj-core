"use strict";

/**
 * Requirements
 */
const LiteralNode = require(SOURCE_ROOT + '/transformer/node/LiteralNode.js').LiteralNode;
const valueNodeSpec = require(TEST_ROOT + '/transformer/node/ValueNodeShared.js');


/**
 * Spec
 */
describe(LiteralNode.className, function()
{
    /**
     * ValueNode Test
     */
    valueNodeSpec(LiteralNode, 'transformer.node/LiteralNode',
    {
        nodeFields: [],
        values:
        {
            value: 'value'
        },
        serialized:
        {
            type: LiteralNode.className,
            value: 'value'
        }
    });


    describe('#valueType()', function()
    {
        it('should return the value type', function()
        {
            const testee1 = new LiteralNode('value');
            const testee2 = new LiteralNode(42);
            expect(testee1.valueType).to.be.equal('string');
            expect(testee2.valueType).to.be.equal('number');
        });
    });


    describe('#is()', function()
    {
        it('should allow to check the node value type', function()
        {
            const testee1 = new LiteralNode('value');
            const testee2 = new LiteralNode(42);
            expect(testee1.is(undefined, { valueType: 'string' })).to.be.ok;
            expect(testee1.is(undefined, { valueType: 'number' })).to.be.not.ok;
            expect(testee2.is(undefined, { valueType: 'string' })).to.be.not.ok;
            expect(testee2.is(undefined, { valueType: 'number' })).to.be.ok;
        });
    });
});
