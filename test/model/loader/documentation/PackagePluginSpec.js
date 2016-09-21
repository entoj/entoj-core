/**
 * Requirements
 */
const PackagePlugin = require(SOURCE_ROOT + '/model/loader/documentation/PackagePlugin.js').PackagePlugin;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(PackagePlugin.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathes configuration', function()
        {
            expect(function() { new PackagePlugin(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathes type', function()
        {
            expect(function() { new PackagePlugin('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new PackagePlugin(fixtures.pathes);
            expect(testee.className).to.be.equal('model.loader.documentation/PackagePlugin');
        });
    });


    describe('#execute()', function()
    {
        it('should import all properties for the base entity', function()
        {
            // Disable extends for this test
            fixtures = compact.createFixture(true);
            const testee = new PackagePlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                expect(fixtures.entityGallery.properties.getByPath('default.release')).to.be.ok;
                expect(fixtures.entityGallery.properties.getByPath('default.groups')).to.be.ok;
                expect(fixtures.entityGallery.properties.getByPath('default.tags')).to.be.ok;
                expect(fixtures.entityGallery.properties.getByPath('default.groups.js')).to.be.equal('core');
            });
            return promise;
        });

        it('should import all extended properties for entity in their own namespace', function()
        {
            const testee = new PackagePlugin(fixtures.pathes);
            const promise = testee.execute(fixtures.entityGallery).then(function()
            {
                expect(fixtures.entityGallery.properties.getByPath('extended.groups')).to.be.ok;
                expect(fixtures.entityGallery.properties.getByPath('extended.groups.js')).to.be.equal('extended');
            });
            return promise;
        });
    });
});
