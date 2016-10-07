'use strict';

/**
 * Requirements
 */
const CoreMediaRenderer = require(SOURCE_ROOT + '/transformer/CoreMediaRenderer.js').CoreMediaRenderer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const glob = require('glob');
const fs = require('fs');


/**
 * Spec
 */
describe(CoreMediaRenderer.className, function()
{
    /**
     * Base Test
     */
    baseSpec(CoreMediaRenderer, 'transformer/CoreMediaRenderer');


    /**
     * CoreMediaRenderer Test
     */
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#render()', function()
    {
        const rootPath = FIXTURES_ROOT + '/Transformer/';
        const files = glob.sync('*.input.j2', { cwd: rootPath });
        for (const file of files)
        {
            const basename = file.replace('.input.j2', '');
            it('should conform to fixture ' + basename, function()
            {
                const input = fs.readFileSync(rootPath + file, { encoding: 'utf8' }).replace(/\r/g, '');
                const expected = fs.readFileSync(rootPath + 'CoreMediaRenderer/' + basename + '.expected.jsp', { encoding: 'utf8' });
                const parser = new Parser();
                const nodes = parser.parse(input);
                const testee = new CoreMediaRenderer();
                const jsp = testee.render(nodes);
                expect(jsp).to.be.deep.equal(expected);
            });
        }
    });
});
