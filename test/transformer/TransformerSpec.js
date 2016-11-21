'use strict';

/**
 * Requirements
 */
const Transformer = require(SOURCE_ROOT + '/transformer/Transformer.js').Transformer;
const BaseParser = require(SOURCE_ROOT + '/transformer/BaseParser.js').BaseParser;
const BaseRenderer = require(SOURCE_ROOT + '/transformer/BaseRenderer.js').BaseRenderer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const NodeTransformer = require(SOURCE_ROOT + '/transformer/NodeTransformer.js').NodeTransformer;
const MacroNode = require(SOURCE_ROOT + '/transformer/node/MacroNode.js').MacroNode;
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const BaseMap = require(SOURCE_ROOT + '/base/BaseMap.js').BaseMap;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const co = require('co');
const sinon = require('sinon');


/**
 * Spec
 */
describe(Transformer.className, function()
{
    /**
     * Base Test
     */
    baseSpec(Transformer, 'transformer/Transformer', prepareParameters);

    function prepareParameters(parameters)
    {
        parameters.push(fixtures.globalRepository);
        parameters.push(fixtures.parser);
        parameters.push(fixtures.renderer);
        return parameters;
    }


    /**
     * Transformer Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.globalRepository = fixtures.context.di.create(GlobalRepository);
        fixtures.parser = new BaseParser();
        fixtures.jinjaParser = new Parser();
        fixtures.renderer = new BaseRenderer();
        fixtures.nodeTransformers = [new NodeTransformer(), new NodeTransformer()];
    });


    describe('#parseString()', function()
    {
        it('should parse a given string', function()
        {
            const promise = co(function *()
            {
                sinon.spy(fixtures.parser, 'parse');
                const testee = new Transformer(fixtures.globalRepository, fixtures.parser, fixtures.renderer);
                yield testee.parseString('');
                expect(fixtures.parser.parse.calledOnce).to.be.ok;
            });
            return promise;
        });

        it('should cache parsing results', function()
        {
            const promise = co(function *()
            {
                sinon.spy(fixtures.parser, 'parse');
                const testee = new Transformer(fixtures.globalRepository, fixtures.parser, fixtures.renderer);
                yield testee.parseString('');
                yield testee.parseString('');
                expect(fixtures.parser.parse.calledOnce).to.be.ok;
            });
            return promise;
        });
    });


    describe('#parseMacro()', function()
    {
        it('should parse a given macro by site and name', function()
        {
            const promise = co(function *()
            {
                const testee = new Transformer(fixtures.globalRepository, fixtures.jinjaParser, fixtures.renderer);
                const rootNode = yield testee.parseMacro('base', 'm001_gallery');
                expect(rootNode).to.be.ok;
                expect(rootNode).to.be.instanceof(MacroNode);
                expect(rootNode.name).to.be.equal('m001_gallery');
            });
            return promise;
        });
    });


    describe('#getMacroProperties()', function()
    {
        it('should yield the entity properties for a given macro by site and name', function()
        {
            const promise = co(function *()
            {
                const testee = new Transformer(fixtures.globalRepository, fixtures.jinjaParser, fixtures.renderer);
                const properties = yield testee.getMacroProperties('base', 'm001_gallery');
                expect(properties).to.be.ok;
                expect(properties.className).to.be.equal('base/BaseMap');
            });
            return promise;
        });
    });


    describe('#transformNode()', function()
    {
        it('should apply each configured NodeTransformer to the given rootNode', function()
        {
            const promise = co(function *()
            {
                sinon.spy(fixtures.nodeTransformers[0], 'transform');
                sinon.spy(fixtures.nodeTransformers[1], 'transform');
                const testee = new Transformer(fixtures.globalRepository, fixtures.parser, fixtures.renderer, fixtures.nodeTransformers);
                const rootNode = yield testee.transformNode(new MacroNode());
                expect(rootNode).to.be.ok;
                expect(rootNode).to.be.instanceof(MacroNode);
                expect(fixtures.nodeTransformers[0].transform.calledOnce).to.be.ok;
                expect(fixtures.nodeTransformers[1].transform.calledOnce).to.be.ok;
            });
            return promise;
        });
    });


    describe('#transform()', function()
    {
        it('should parse, transform and render the given source', function()
        {
            const promise = co(function *()
            {
                const testee = new Transformer(fixtures.globalRepository, fixtures.jinjaParser, fixtures.renderer, fixtures.nodeTransformers);
                sinon.spy(testee, 'parseString');
                sinon.spy(testee, 'transformNode');
                sinon.spy(testee, 'renderNode');
                const result = yield testee.transform('');
                expect(result).to.be.equal(''); // The BaseRenderer will always return ''
                expect(testee.parseString.calledOnce).to.be.ok;
                expect(testee.transformNode.calledOnce).to.be.ok;
                expect(testee.renderNode.calledOnce).to.be.ok;
            });
            return promise;
        });
    });


    describe('#transformMacro()', function()
    {
        it('should parse, transform and render the given macro by site and name', function()
        {
            const promise = co(function *()
            {
                const testee = new Transformer(fixtures.globalRepository, fixtures.jinjaParser, fixtures.renderer, fixtures.nodeTransformers);
                sinon.spy(testee, 'parseMacro');
                sinon.spy(testee, 'transformNode');
                sinon.spy(testee, 'renderNode');
                const result = yield testee.transformMacro('base', 'm001_gallery');
                expect(result).to.be.equal(''); // The BaseRenderer will always return ''
                expect(testee.parseMacro.calledOnce).to.be.ok;
                expect(testee.transformNode.calledOnce).to.be.ok;
                expect(testee.renderNode.calledOnce).to.be.ok;
            });
            return promise;
        });
    });
});
