/**
 * Requirements
 */
const JinjaPlugin = require(SOURCE_ROOT + '/model/loader/documentation/JinjaPlugin.js').JinjaPlugin;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const DocumentationCallable = require(SOURCE_ROOT + '/model/documentation/DocumentationCallable.js').DocumentationCallable;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(JinjaPlugin.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathes configuration', function()
        {
            expect(function() { new JinjaPlugin(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathes type', function()
        {
            expect(function() { new JinjaPlugin('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new JinjaPlugin(fixtures.pathes);
            expect(testee.className).to.be.equal('model.loader.documentation/JinjaPlugin');
        });
    });


    describe('#execute()', function()
    {
        it('should add all parsed files to files', function()
        {
            const testee = new JinjaPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const files = fixtures.entityGallery.files;
                expect(files.filter(file => file.contentType == ContentType.JINJA)).to.have.length(2);
                expect(files.find(file => file.basename == 'm001-gallery.j2')).to.be.ok;
                expect(files.find(file => file.basename == 'helper.j2')).to.be.ok;
            });
            return promise;
        });

        it('should add documentation for all parsed files', function()
        {
            const testee = new JinjaPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const documentation = fixtures.entityGallery.documentation;
                expect(documentation.filter(doc => doc.contentType == ContentType.JINJA)).to.have.length(3);
                expect(documentation.find(doc => doc.name == 'm001_gallery')).to.be.instanceof(DocumentationCallable);
                expect(documentation.find(doc => doc.name == 'm001_gallery_internal')).to.be.instanceof(DocumentationCallable);
                expect(documentation.find(doc => doc.name == 'm001_gallery_helper')).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });
    });
});