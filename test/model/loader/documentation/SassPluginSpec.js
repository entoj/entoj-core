/**
 * Requirements
 */
const SassPlugin = require(SOURCE_ROOT + '/model/loader/documentation/SassPlugin.js').SassPlugin;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const DocumentationCallable = require(SOURCE_ROOT + '/model/documentation/DocumentationCallable.js').DocumentationCallable;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(SassPlugin.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathes configuration', function()
        {
            expect(function() { new SassPlugin(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathes type', function()
        {
            expect(function() { new SassPlugin('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new SassPlugin(fixtures.pathes);
            expect(testee.className).to.be.equal('model.loader.documentation/SassPlugin');
        });
    });


    describe('#execute()', function()
    {
        it('should add all parsed files to files', function()
        {
            const testee = new SassPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const files = fixtures.entityGallery.files;
                expect(files.filter(file => file.contentType == ContentType.SASS)).to.have.length(1);
                expect(files.find(file => file.basename == 'm001-gallery.scss')).to.be.ok;
            });
            return promise;
        });

        it('should add documentation for all parsed files', function()
        {
            const testee = new SassPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const documentation = fixtures.entityGallery.documentation;
                expect(documentation.filter(doc => doc.contentKind == ContentKind.CSS)).to.have.length(1);
                expect(documentation.find(doc => doc.name == 'm001_gallery-button-size')).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });
    });
});