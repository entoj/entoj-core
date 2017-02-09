'use strict';

/**
 * Requirements
 */
const JspRemoveMacroCallTransformer = require(SOURCE_ROOT + '/transformer/nodetransformer/JspRemoveMacroCallTransformer.js').JspRemoveMacroCallTransformer;
const BaseRenderer = require(SOURCE_ROOT + '/transformer/BaseRenderer.js').BaseRenderer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const Transformer = require(SOURCE_ROOT + '/transformer/Transformer.js').Transformer;
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const CoreMediaRenderer = require(SOURCE_ROOT + '/transformer/CoreMediaRenderer.js').CoreMediaRenderer;
const GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const nodeTransformerSpec = require(TEST_ROOT + '/transformer/NodeTransformerShared.js');
const co = require('co');
const fs = require('fs');


/**
 * Spec
 */
describe(JspRemoveMacroCallTransformer.className, function()
{
    /**
     * NodeTransformer Test
     */
    nodeTransformerSpec(JspRemoveMacroCallTransformer, 'transformer/nodetransformer/JspRemoveMacroCallTransformer');


    /**
     * Transformer Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.globalRepository = fixtures.context.di.create(GlobalRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.parser = new Parser();
        fixtures.renderer = new CoreMediaRenderer(fixtures.globalRepository, new GlobalConfiguration(), fixtures.pathesConfiguration);
        fixtures.transformer = new Transformer(fixtures.globalRepository, fixtures.parser, fixtures.renderer);
    });


    /**
     * JspRemoveMacroCallTransformer Test
     */
    describe('#transform()', function()
    {
        it('should remove macro calls', function()
        {
            const promise = co(function *()
            {
                const macro = yield fixtures.transformer.parseMacro('base', 'm001_gallery');
                const testee = new JspRemoveMacroCallTransformer();
                const result = yield testee.transform(macro, fixtures.transformer);
                const path = FIXTURES_ROOT + '/Transformer/NodeTransformer/JspRemoveMacroCallTransformer.expected.json';
                const expected = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
                //const rendered = yield fixtures.transformer.renderNode(result);
                //console.log(rendered);
                //console.log(JSON.stringify(result.serialize(), null, 4));
                expect(result.serialize()).to.be.deep.equal(expected);
            });
            return promise;
        });
    });
});
