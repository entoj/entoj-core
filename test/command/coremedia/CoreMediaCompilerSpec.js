"use strict";

/**
 * Requirements
 * @ignore
 */
const CoreMediaCompiler = require(SOURCE_ROOT + '/command/coremedia/CoreMediaCompiler.js').CoreMediaCompiler;
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const Transformer = require(SOURCE_ROOT + '/transformer/Transformer.js').Transformer;
const BaseRenderer = require(SOURCE_ROOT + '/transformer/BaseRenderer.js').BaseRenderer;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const sinon = require('sinon');
const co = require('co');
const fs = require('fs-extra');


/**
 * Spec
 */
describe(CoreMediaCompiler.className, function()
{
    /**
     * Base Test
     */
    baseSpec(CoreMediaCompiler, 'command.coremedia/CoreMediaCompiler', function(parameters)
    {
        parameters.unshift(fixtures.transformer);
        parameters.unshift(fixtures.globalRepository);
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    });


    /**
     * CoreMediaCompiler Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = fixtures.context.di.create(CliLogger);
        fixtures.cliLogger.muted = true;
        fixtures.globalRepository = fixtures.context.di.create(GlobalRepository);
        fixtures.parser = new Parser();
        fixtures.renderer = new BaseRenderer();
        fixtures.transformer = new Transformer(fixtures.globalRepository, fixtures.parser, fixtures.renderer);
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Commands/CoreMediaCompiler');
        fs.emptyDirSync(fixtures.path);
    });


    describe('#compile()', function()
    {
        it('should return a promise', function()
        {
            const testee = new CoreMediaCompiler(fixtures.cliLogger, fixtures.globalRepository, fixtures.transformer);
            const promise = testee.compile();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should compile each configured coremedia release for each entity', function()
        {
            const testee = new CoreMediaCompiler(fixtures.cliLogger, fixtures.globalRepository, fixtures.transformer);
            sinon.spy(testee, 'compileEntities');
            sinon.spy(testee, 'compileEntity');
            const promise = co(function *()
            {
                yield testee.compile();
                expect(testee.compileEntities.callCount).to.be.equal(1);
                expect(testee.compileEntity.callCount).to.be.equal(4);
            });
            return promise;
        });

        it('should write all compiled entities to the filesystem when a path is configured', function()
        {
            const testee = new CoreMediaCompiler(fixtures.cliLogger, fixtures.globalRepository, fixtures.transformer);
            sinon.spy(testee, 'writeFiles');
            const promise = co(function *()
            {
                yield testee.compile({ path: fixtures.path });
                expect(testee.writeFiles.callCount).to.be.equal(1);
                expect(fs.existsSync(pathes.concat(fixtures.path, '/base/modules/m001-gallery/m001-gallery.jsp'))).to.be.ok;
                expect(fs.existsSync(pathes.concat(fixtures.path, '/base/modules/m001-gallery/CMCollection.m-gallery.jsp'))).to.be.ok;
                expect(fs.existsSync(pathes.concat(fixtures.path, '/extended/modules/m001-gallery/m001-gallery.jsp'))).to.be.ok;
                expect(fs.existsSync(pathes.concat(fixtures.path, '/extended/modules/m001-gallery/CMCollection.m-gallery.jsp'))).to.be.ok;
            });
            return promise;
        });
    });
});
