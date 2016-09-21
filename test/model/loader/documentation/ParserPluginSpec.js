/**
 * Requirements
 */
const ParserPlugin = require(SOURCE_ROOT + '/model/loader/documentation/ParserPlugin.js').ParserPlugin;
const Parser = require(SOURCE_ROOT + '/parser/Parser.js').Parser;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const sinon = require('sinon');


/**
 * Spec
 */
describe(ParserPlugin.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathes configuration', function()
        {
            expect(function() { new ParserPlugin(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathes type', function()
        {
            expect(function() { new ParserPlugin('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new ParserPlugin(fixtures.pathes);
            expect(testee.className).to.be.equal('model.loader.documentation/ParserPlugin');
        });
    });


    describe('#execute()', function()
    {
        it('should parse the base entity', function()
        {
            // Disable extends for this test
            fixtures = compact.createFixture(true);

            const testee = new ParserPlugin(fixtures.pathes);
            testee.parser = new Parser();
            sinon.spy(testee.parser, 'parse');
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                expect(testee.parser.parse.calledOnce).to.be.ok;
            });
            return promise;
        });

        it('should parse each derived entity', function()
        {
            const testee = new ParserPlugin(fixtures.pathes);
            testee.parser = new Parser();
            sinon.spy(testee.parser, 'parse');
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                // Default & Extended
                expect(testee.parser.parse.calledTwice).to.be.ok;
            });
            return promise;
        });
    });
});
