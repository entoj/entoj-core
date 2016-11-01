'use strict';

/**
 * Requirements
 */
const CoreMediaRenderer = require(SOURCE_ROOT + '/transformer/CoreMediaRenderer.js').CoreMediaRenderer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const baseRendererSpec = require(TEST_ROOT + '/transformer/BaseRendererShared.js');
const glob = require('glob');
const fs = require('fs');
const co = require('co');


/**
 * Spec
 */
describe(CoreMediaRenderer.className, function()
{
    /**
     * Base Test
     */
    baseRendererSpec(CoreMediaRenderer, 'transformer/CoreMediaRenderer');


    /**
     * CoreMediaRenderer Test
     */
    function testFixture(name)
    {
        const promise = co(function*()
        {
            const rootPath = FIXTURES_ROOT + '/Transformer/';
            const input = fs.readFileSync(rootPath + name + '.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const expected = fs.readFileSync(rootPath + 'CoreMediaRenderer/' + name + '.expected.jsp', { encoding: 'utf8' }).replace(/\r/g, '');
            const parser = new Parser();
            const nodes = yield parser.parse(input);
            const testee = new CoreMediaRenderer();
            const jsp = yield testee.render(nodes);
            try
            {
                expect(jsp.trim()).to.be.deep.equal(expected.trim());
            }
            catch(e)
            {
                console.log('Parsed:');
                console.log(JSON.stringify(nodes.serialize(), null, 4));
                console.log('Rendered:');
                console.log(jsp);
                throw e;
            }
        });
        return promise;
    }


    xdescribe('#render()', function()
    {
        it('should render embedded variables', function()
        {
            return testFixture('variables');
        });

        it('should render set tags', function()
        {
            return testFixture('set');
        });

        it('should render filters', function()
        {
            return testFixture('filter');
        });

        it('should render macro calls', function()
        {
            return testFixture('calls');
        });

        it('should render flow tags (if, for)', function()
        {
            return testFixture('flow');
        });

        it('should render conditions', function()
        {
            return testFixture('condition');
        });

        it('should render macros', function()
        {
            return testFixture('macro');
        });

        it('should render translate filters', function()
        {
            return testFixture('translate');
        });
    });
});
