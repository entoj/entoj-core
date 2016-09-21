/**
 * Requirements
 */
const MarkdownPlugin = require(SOURCE_ROOT + '/model/loader/documentation/MarkdownPlugin.js').MarkdownPlugin;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const DocumentationText = require(SOURCE_ROOT + '/model/documentation/DocumentationText.js').DocumentationText;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(MarkdownPlugin.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathes configuration', function()
        {
            expect(function() { new MarkdownPlugin(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathes type', function()
        {
            expect(function() { new MarkdownPlugin('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new MarkdownPlugin(fixtures.pathes);
            expect(testee.className).to.be.equal('model.loader.documentation/MarkdownPlugin');
        });
    });


    describe('#execute()', function()
    {
        it('should add all parsed files to file', function()
        {
            const testee = new MarkdownPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const files = fixtures.entityGallery.files;
                expect(files.filter(file => file.contentType == ContentType.MARKDOWN)).to.have.length(1);
                expect(files.find(file => file.basename == 'm001-gallery.md')).to.be.ok;
            });
            return promise;
        });

        it('should add documentation for all parsed files', function()
        {
            const testee = new MarkdownPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const documentation = fixtures.entityGallery.documentation;
                expect(documentation.filter(doc => doc.contentType == ContentType.MARKDOWN)).to.have.length(1);
                expect(documentation[0]).to.be.instanceof(DocumentationText);
            });
            return promise;
        });
    });
});