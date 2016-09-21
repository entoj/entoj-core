"use strict";

/**
 * Requirements
 */
const LoadTag = require(SOURCE_ROOT + '/nunjucks/tag/LoadTag.js').LoadTag;
const nunjucks = require('nunjucks');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');


/**
 * Spec
 */
describe(LoadTag.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.environment = new nunjucks.Environment();
        fixtures.environment.addExtension('load', new LoadTag(fixtures.basePath));
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new LoadTag();
            expect(testee.className).to.be.equal('nunjucks.tag/LoadTag');
        });
    });


    describe('{% load \'...\' %}', function()
    {
        it('should load the given json file as variables into the current context', function()
        {
            let testee = fixtures.environment.renderString("{% load '/default/modules/m001-gallery/model/default.json' %}Type:{{ type }}, PaginationMode:{{ paginationMode }}");
            expect(testee).to.contain('Type:default');
            expect(testee).to.contain('PaginationMode:graphical');
        });

        it('should do nothing if file does not exist', function()
        {
            let testee = fixtures.environment.renderString("{% load '/error/default/modules/m001-gallery/model/default.json' %}Type:'{{ type }}'");
            expect(testee).to.contain('Type:\'\'');
        });
    });


    describe('{% load \'...\' into \'...\' %}', function()
    {
        it('should load the given json file into the given variables in the current context', function()
        {
            let testee = fixtures.environment.renderString("{% load '/default/modules/m001-gallery/model/default.json' into 'model' %}Type:{{ model.type }}, PaginationMode:{{ model.paginationMode }}");
            expect(testee).to.contain('Type:default');
            expect(testee).to.contain('PaginationMode:graphical');
        });

        it('should do nothing if file does not exist', function()
        {
            let testee = fixtures.environment.renderString("{% load '/error/default/modules/m001-gallery/model/default.json' into 'model' %}Type:'{{ model.type }}'");
            expect(testee).to.contain('Type:\'\'');
        });
    });
});