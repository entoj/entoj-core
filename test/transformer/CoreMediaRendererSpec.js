'use strict';

/**
 * Requirements
 */
const CoreMediaRenderer = require(SOURCE_ROOT + '/transformer/CoreMediaRenderer.js').CoreMediaRenderer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const baseRendererSpec = require(TEST_ROOT + '/transformer/BaseRendererShared.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
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
    baseRendererSpec(CoreMediaRenderer, 'transformer/CoreMediaRenderer', prepareParameters);


    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.globalConfiguration);
        parameters.unshift(fixtures.globalRepository);
        return parameters;
    };


    /**
     * CoreMediaRenderer Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.parser = fixtures.context.di.create(Parser);
        fixtures.globalRepository = fixtures.context.di.create(GlobalRepository);
        fixtures.mediaQueries =
        {
            applicationAndAbove: '(min-width: 1280px)',
            application: '(min-width: 1280px)',
            tabletAndBelow: '(max-width: 1024px)',
            tabletAndAbove: '(min-width: 1024px)',
            tablet: '(min-width: 1024px) and (max-width: 1024px)',
            mobileAndBelow: '(max-width: 375px)',
            mobile: '(max-width: 375px)'
        };
        fixtures.globalConfiguration = new GlobalConfiguration({ mediaQueries: fixtures.mediaQueries });
    });

    function testFixture(name)
    {
        const promise = co(function*()
        {
            const rootPath = FIXTURES_ROOT + '/Transformer/';
            const input = fs.readFileSync(rootPath + name + '.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const expected = fs.readFileSync(rootPath + 'CoreMediaRenderer/' + name + '.expected.jsp', { encoding: 'utf8' }).replace(/\r/g, '');
            const parser = new Parser();
            const nodes = yield parser.parse(input);
            const testee = new CoreMediaRenderer(...prepareParameters([]));
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

    describe('#render()', function()
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

        it('should render custom coremedia filters', function()
        {
            return testFixture('coremedia-filter');
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

        it('should render complex variables', function()
        {
            return testFixture('complexvariables');
        });
    });

    describe('#render()', function()
    {
        it('should add all parameters to macro calls', function()
        {
            const promise = co(function *()
            {
                const expectedSource = fs.readFileSync(FIXTURES_ROOT + '/Transformer/CoreMediaRenderer/calls-parameters.expected.jsp', { encoding: 'utf8' });
                const macroSource = fs.readFileSync(FIXTURES_ROOT + '/Application/Compact/sites/base/modules/m001-gallery/m001-gallery.j2', { encoding: 'utf8' });
                const macro = yield fixtures.parser.parse(macroSource);
                const testee = new CoreMediaRenderer(fixtures.globalRepository, fixtures.globalConfiguration);
                const source = yield testee.render(macro);
                expect(source).to.be.equal(expectedSource);
            });
            return promise;
        });

        xit('should allow to override view names via settings.views', function()
        {
            const promise = co(function *()
            {
                const macroSource = fs.readFileSync(FIXTURES_ROOT + '/Application/Compact/sites/base/modules/m001-gallery/m001-gallery.j2', { encoding: 'utf8' });
                const macro = yield fixtures.parser.parse(macroSource);
                const testee = new CoreMediaRenderer(fixtures.globalRepository, fixtures.globalConfiguration);
                const source = yield testee.render(macro);
                expect(source).to.be.equal(expectedSource);
            });
            return promise;
        });
    });
});
