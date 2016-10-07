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


    describe('#transform()', function()
    {
        const rootPath = FIXTURES_ROOT + '/Transformer/';

        it('should visit all nodes', function()
        {
            const input = fs.readFileSync(rootPath + 'calls.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const parser = new Parser();
            const rootNode = parser.parse(input);
            const testee = new NodeTransformer();
            const transformed = testee.transform(rootNode);

            //console.log(rootNode);
            //console.log(transformed);
        });
    });
});
