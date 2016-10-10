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


    function testFixture(name)
    {
        const rootPath = FIXTURES_ROOT + '/Transformer/';
        const input = fs.readFileSync(rootPath + name + '.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
        const expected = fs.readFileSync(rootPath + 'CoreMediaRenderer/' + name + '.expected.jsp', { encoding: 'utf8' }).replace(/\r/g, '');
        const parser = new Parser();
        const nodes = parser.parse(input);
        //console.log(JSON.stringify(nodes.serialize(), null, 4));
        const testee = new CoreMediaRenderer();
        const jsp = testee.render(nodes);
        expect(jsp).to.be.deep.equal(expected);
    }


    xdescribe('#render()', function()
    {
        it('should render embedded variables', function()
        {
            testFixture('variables');
        });

        it('should render set tags', function()
        {
            testFixture('set');
        })

        it('should render macro calls', function()
        {
            testFixture('calls');
        })

        it('should render flow tags (if, for)', function()
        {
            testFixture('flow');
        })
    });
});
