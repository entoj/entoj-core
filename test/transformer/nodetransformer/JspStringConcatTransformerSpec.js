'use strict';

/**
 * Requirements
 */
const JspStringConcatTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspStringConcatTransformer.js').JspStringConcatTransformer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const glob = require('glob');
const fs = require('fs');


/**
 * Spec
 */
describe(JspStringConcatTransformer.className, function()
{
    /**
     * Base Test
     */
    baseSpec(JspStringConcatTransformer, 'transformer/nodetransformer/JspStringConcatTransformer');


    /**
     * JspStringConcatTransformer Test
     */
    beforeEach(function()
    {
        fixtures = {};
    });


    xdescribe('#transform()', function()
    {
        const rootPath = FIXTURES_ROOT + '/Transformer/NodeTransformer/';

        it('should replace standard string concatination like classes + \'\' with classes += \'\'', function()
        {
            const input = fs.readFileSync(rootPath + 'JspStringConcatTransformer.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const expected = JSON.parse(fs.readFileSync(rootPath + 'JspStringConcatTransformer.expected.json', { encoding: 'utf8' }));
            const parser = new Parser();
            const nodes = parser.parse(input);
            console.log(JSON.stringify(nodes.serialize(), null, 4));
            const testee = new JspStringConcatTransformer();
            const transformed = testee.transform(nodes);
            expect(transformed.serialize()).to.be.deep.equal(expected);
        });
    });
});
