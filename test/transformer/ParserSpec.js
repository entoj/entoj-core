'use strict';

/**
 * Requirements
 */
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const glob = require('glob');
const fs = require('fs');


/**
 * Spec
 */
describe(Parser.className, function()
{
    /**
     * Base Test
     */
    baseSpec(Parser, 'transformer/Parser');


    /**
     * Parser Test
     */
    beforeEach(function()
    {
        fixtures = {};
    });


    function testFixture(name)
    {
        const rootPath = FIXTURES_ROOT + '/Transformer/';
        const input = fs.readFileSync(rootPath + name + '.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
        const expected = JSON.parse(fs.readFileSync(rootPath + 'Parser/' + name + '.expected.json', { encoding: 'utf8' }));
        const testee = new Parser();
        const node = testee.parse(input);
        //console.log(JSON.stringify(node.serialize(), null, 4));
        expect(node.serialize()).to.be.deep.equal(expected);
    }


    xdescribe('#parse()', function()
    {
        it('should parse embedded variables', function()
        {
            testFixture('variables');
        });

        it('should parse set tags', function()
        {
            testFixture('set');
        })

        it('should parse macro calls', function()
        {
            testFixture('calls');
        })

        it('should parse flow tags (if, for)', function()
        {
            testFixture('flow');
        })
    });
});
