'use strict';

/**
 * Requirements
 */
const EntityIdTemplate = require(SOURCE_ROOT + '/model/entity/EntityIdTemplate.js').EntityIdTemplate;
const Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
const CompactIdParser = require(SOURCE_ROOT + '/parser/entity/CompactIdParser.js').CompactIdParser;
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const baseSpec = require('../../BaseShared.js').spec;


/**
 * Spec
 */
describe(EntityIdTemplate.className, function()
{
    baseSpec(EntityIdTemplate, 'model.entity/EntityIdTemplate', function(parameters)
    {
        parameters.unshift(fixtures.entityIdParser);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#id', function()
    {
        it('should return an empty string when no id given', function()
        {
            const testee = new EntityIdTemplate(fixtures.entityIdParser);
            expect(testee.id()).to.equal('');
        });

        it('should return a entity id as a string', function()
        {
            const testee = new EntityIdTemplate(fixtures.entityIdParser);
            expect(testee.id(fixtures.entityIdButton)).to.equal('e005-button');
        });

        it('should return a entity id as a string for a global entity', function()
        {
            const testee = new EntityIdTemplate(fixtures.entityIdParser);
            expect(testee.id(fixtures.entityIdCommon)).to.equal('common');
        });

        it('should derive the template from the used parser', function()
        {
            const entityIdParser = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository,
            {
                TEMPLATE_ID: '${entityCategory.shortName.urlify()}-${entityId.name.urlify()}'
            });
            const testee = new EntityIdTemplate(entityIdParser);
            expect(testee.id(fixtures.entityIdButton)).to.equal('e-button');
        });
    });


    describe('#path', function()
    {
        it('should return an empty string when no id given', function()
        {
            const testee = new EntityIdTemplate(fixtures.entityIdParser);
            expect(testee.path()).to.equal('');
        });

        it('should return a entity path as a string', function()
        {
            const testee = new EntityIdTemplate(fixtures.entityIdParser);
            expect(testee.path(fixtures.entityIdButton)).to.equal('/default/elements/e005-button');
        });

        it('should return a entity path as a string for a global entity', function()
        {
            const testee = new EntityIdTemplate(fixtures.entityIdParser);
            expect(testee.path(fixtures.entityIdCommon)).to.equal('/default/common');
        });

        it('should derive the template from the used parser', function()
        {
            const entityIdParser = new CompactIdParser(fixtures.sitesRepository, fixtures.categoriesRepository,
            {
                TEMPLATE_ID: '${entityCategory.shortName.urlify()}-${entityId.name.urlify()}'
            });
            const testee = new EntityIdTemplate(entityIdParser);
            expect(testee.path(fixtures.entityIdButton)).to.equal('/default/elements/e-button');
        });
    });
});
