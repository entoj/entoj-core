"use strict";

/**
 * Requirements
 */
const Template = require(SOURCE_ROOT + '/nunjucks/Template.js').Template;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const stopWatch = require(SOURCE_ROOT + '/utils/StopWatch.js').stopWatch;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');


/**
 * Spec
 */
describe(Template.className, function()
{
    /**
     * Base Test
     */
    baseSpec(Template, 'nunjucks/Template', function(parameters)
    {
        parameters.unshift(fixtures.entitiesRepository);
        return parameters;
    });


    /**
     * Template Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
    });


    describe('#getInclude', function()
    {
        it('should return false for a non existing macro', function()
        {
            const testee = new Template(fixtures.entitiesRepository, fixtures.pathesConfiguration.sites);
            const include = testee.getInclude('m002_gallery');
            expect(include).to.be.not.ok;
        });

        it('should return a jinja import for a existing macro', function()
        {
            const testee = new Template(fixtures.entitiesRepository, fixtures.pathesConfiguration.sites);
            const include = testee.getInclude('m001_gallery');
            expect(include).to.be.equal('{% from "/base/modules/m001-gallery/m001-gallery.j2" import m001_gallery %}');
        });
    });


    describe('#prepare', function()
    {
        it('should add all necessary includes', function()
        {
            const testee = new Template(fixtures.entitiesRepository, fixtures.pathesConfiguration.sites);
            const input = `{{ e005_button() }}`;
            const source = testee.prepare(input);
            expect(source).to.include('{% from "/base/elements/e005-button/e005-button.j2" import e005_button %}');
        });

        it('should not create cyclic dependencies', function()
        {
            const testee = new Template(fixtures.entitiesRepository, fixtures.pathesConfiguration.sites);
            const input = `{% macro e005_button() %}{% endmacro %}{{ m001_gallery() }}{{ e005_button() }}`;
            const source = testee.prepare(input);
            expect(source).to.include('{% from "/base/modules/m001-gallery/m001-gallery.j2" import m001_gallery %}');
            expect(source).to.not.include('{% from "/base/elements/e005-button/e005-button.j2" import e005_button %}');
        });

        it('should support environments', function()
        {
            const testee = new Template(fixtures.entitiesRepository, fixtures.pathesConfiguration.sites);
            const input = `All{# +environment: development #}-Development{# -environment #}`;
            expect(testee.prepare(input)).to.be.equal('All');
            expect(testee.prepare(input, 'development')).to.be.equal('All-Development');
        });
    });
});
