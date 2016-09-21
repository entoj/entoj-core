/**
 * Requirements
 */
const ExamplePlugin = require(SOURCE_ROOT + '/model/loader/documentation/ExamplePlugin.js').ExamplePlugin;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const DocumentationExample = require(SOURCE_ROOT + '/model/documentation/DocumentationExample.js').DocumentationExample;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(ExamplePlugin.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathes configuration', function()
        {
            expect(function() { new ExamplePlugin(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathes type', function()
        {
            expect(function() { new ExamplePlugin('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new ExamplePlugin(fixtures.pathes);
            expect(testee.className).to.be.equal('model.loader.documentation/ExamplePlugin');
        });
    });


    describe('#execute()', function()
    {
        it('should add any parsed files to files', function()
        {
            const testee = new ExamplePlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const files = fixtures.entityGallery.files;
                expect(files.filter(file => file.contentType == ContentType.JINJA)).to.have.length(2);
                expect(files.find(file => file.basename == 'default.j2')).to.be.ok;
                expect(files.find(file => file.basename == 'default.j2').site).to.be.equal(fixtures.siteDefault);
                expect(files.find(file => file.basename == 'hero.j2')).to.be.ok;
                expect(files.find(file => file.basename == 'hero.j2').site).to.be.equal(fixtures.siteDefault);
            });
            return promise;
        });

        it('should add documentation for all parsed files', function()
        {
            const testee = new ExamplePlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const documentation = fixtures.entityGallery.documentation;
                expect(documentation.filter(doc => doc.contentKind == ContentKind.EXAMPLE)).to.have.length(2);
                expect(documentation.find(doc => doc.name == 'default.j2')).to.be.instanceof(DocumentationExample);
                expect(documentation.find(doc => doc.name == 'hero.j2')).to.be.instanceof(DocumentationExample);
            });
            return promise;
        });
    });
});
