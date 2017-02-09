/**
 * Requirements
 */
const DatamodelPlugin = require(SOURCE_ROOT + '/model/loader/documentation/DatamodelPlugin.js').DatamodelPlugin;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const DocumentationDatamodel = require(SOURCE_ROOT + '/model/documentation/DocumentationDatamodel.js').DocumentationDatamodel;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(DatamodelPlugin.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathes configuration', function()
        {
            expect(function() { new DatamodelPlugin(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathes type', function()
        {
            expect(function() { new DatamodelPlugin('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new DatamodelPlugin(fixtures.pathes);
            expect(testee.className).to.be.equal('model.loader.documentation/DatamodelPlugin');
        });
    });


    describe('#execute()', function()
    {

        it('should add all parsed datamodel files to files', function()
        {
            const testee = new DatamodelPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const files = fixtures.entityGallery.files;
                expect(files.filter(file => file.contentKind == ContentKind.DATAMODEL)).to.have.length(1);
                expect(files.find(file => file.basename == 'default.json')).to.be.ok;
            });
            return promise;
        });

        it('should add documentation for all parsed files', function()
        {
            const testee = new DatamodelPlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                const documentation = fixtures.entityGallery.documentation;
                expect(documentation.filter(doc => doc.contentKind == ContentKind.DATAMODEL)).to.have.length(1);
                expect(documentation.find(doc => doc.name == 'default.json')).to.be.instanceof(DocumentationDatamodel);
            });
            return promise;
        });

    });
});
