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


    describe('#parse()', function()
    {
        const rootPath = FIXTURES_ROOT + '/Transformer/';
        const files = glob.sync('*.input.j2', { cwd: rootPath });
        for (const file of files)
        {
            const basename = file.replace('.input.j2', '');
            it('should conform to fixture ' + basename, function()
            {
                const input = fs.readFileSync(rootPath + file, { encoding: 'utf8' }).replace(/\r/g, '');
                const expected = JSON.parse(fs.readFileSync(rootPath + 'Parser/' + basename + '.expected.json', { encoding: 'utf8' }));
                const testee = new Parser();
                const tokens = testee.parse(input).serialize();
                //console.log(JSON.stringify(tokens, null, 4));
                expect(tokens).to.be.deep.equal(expected);
            });
        }
    });
});
