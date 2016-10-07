"use strict";

/**
 * Requirements
 */
const TextNode = require(SOURCE_ROOT + '/transformer/node/TextNode.js').TextNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(TextNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(TextNode, 'transformer.node/TextNode',
    {
        nodeFields: [],
        serialized:
        {
            type: TextNode.className,
            value: undefined
        }
    });


    /**
     * TextNode Test
     */
    describe('#constructor()', function()
    {
        it('should allow to populate value', function()
        {
            const testee = new TextNode('value');
            expect(testee.value).to.be.equal('value');
        });
    });
});
