/**
 * Requirements
 */
const EntityId = require(SOURCE_ROOT + '/model/entity/EntityId.js').EntityId;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(EntityId.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor', function()
    {
        it('should throw a exception when created without a category', function()
        {
            expect(function() { new EntityId(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper category type', function()
        {
            expect(function() { new EntityId('Category', 'Button'); }).to.throw(TypeError);
        });

        it('should allow to configure category, name, number, site and template', function()
        {
            const testee = new EntityId(fixtures.categoryElement, 'Button', 1, fixtures.siteDefault, fixtures.entityIdTemplate);
            expect(testee.category).to.equal(fixtures.categoryElement);
            expect(testee.name).to.equal('Button');
            expect(testee.number).to.equal(1);
            expect(testee.site).to.equal(fixtures.siteDefault);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new EntityId(fixtures.categoryElement, 'Button', 1, fixtures.siteDefault, fixtures.entityIdTemplate);
            expect(testee.className).to.be.equal('model.entity/EntityId');
        });
    });


    describe('#isEqualTo', function()
    {
        it('should return true when both entityIds have the same value', function()
        {
            const testee = new EntityId(fixtures.categoryElement, 'Button', undefined, fixtures.siteDefault, fixtures.entityIdTemplate);
            const other = new EntityId(fixtures.categoryElement, 'Button', undefined, fixtures.siteDefault, fixtures.entityIdTemplate);
            expect(testee.isEqualTo(other)).to.be.ok;
        });

        it('should return false when both entityIds don´t have the same value', function()
        {
            const testee = new EntityId(fixtures.categoryElement, 'Button', undefined, fixtures.siteDefault, fixtures.entityIdTemplate);
            const other = new EntityId(fixtures.categoryElement, 'Button', 1, fixtures.siteDefault, fixtures.entityIdTemplate);
            expect(testee.isEqualTo(other)).to.be.not.ok;
        });

    });


    describe('#asString', function()
    {
        it('should return a id and path based on the configured templates', function()
        {
            const testee = new EntityId(fixtures.categoryElement, 'Button', 1, fixtures.siteDefault, fixtures.entityIdTemplate);;
            expect(testee.asString(EntityId.ID)).to.be.equal('e001-button');
            expect(testee.asString(EntityId.PATH)).to.be.equal('/default/elements/e001-button');
        });

        it('should use different templates for global categories', function()
        {
            const testee = new EntityId(fixtures.categoryCommon, undefined, undefined, fixtures.siteDefault, fixtures.entityIdTemplate);
            expect(testee.asString(EntityId.ID)).to.be.equal('common');
            expect(testee.asString(EntityId.PATH)).to.be.equal('/default/common');
        });
    });


    describe('#toString', function()
    {
        it('should return a string representation that reflects its state', function()
        {
            const testee = new EntityId(fixtures.categoryElement, 'Button', 1, fixtures.siteDefault, fixtures.entityIdTemplate);
            expect(testee.toString()).to.be.equal('[model.entity/EntityId Element Button]');
        });
    });
});
