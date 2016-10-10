'use strict';

/**
 * Requirements
 */
const NodeTransformer = require(SOURCE_ROOT + '/transformer/NodeTransformer.js').NodeTransformer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const glob = require('glob');
const fs = require('fs');


/**
 * Spec
 */
describe(NodeTransformer.className, function()
{
    /**
     * Base Test
     */
    baseSpec(NodeTransformer, 'transformer/NodeTransformer');


    /**
     * NodeTransformer Test
     */
    beforeEach(function()
    {
        fixtures = {};
    });


    xdescribe('#transform()', function()
    {
        const rootPath = FIXTURES_ROOT + '/Transformer/';

        it('should visit all nodes and clone them', function()
        {
            const input = fs.readFileSync(rootPath + 'calls.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const parser = new Parser();
            const rootNode = parser.parse(input);
            const testee = new NodeTransformer();
            const transformed = testee.transform(rootNode);

            // Shoud be new objects
            expect(transformed).to.be.not.deep.equal(rootNode);

            // Shoud have the same structure
            expect(transformed.serialize()).to.be.deep.equal(rootNode.serialize());
        });
    });
});
