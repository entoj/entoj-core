"use strict";

/**
 * Requirements
 */
const StyleguideRepository = require(SOURCE_ROOT + '/model/styleguide/StyleguideRepository.js').StyleguideRepository;
const StyleguidePage = require(SOURCE_ROOT + '/model/styleguide/StyleguidePage.js').StyleguidePage;
const Context = require(SOURCE_ROOT + '/application/Context.js').Context;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const DocumentationVariable = require(SOURCE_ROOT + '/model/documentation/DocumentationVariable.js').DocumentationVariable;
const DocumentationClass = require(SOURCE_ROOT + '/model/documentation/DocumentationClass.js').DocumentationClass;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const styleguide = require(FIXTURES_ROOT + '/Styleguide/styleguide.js');


/**
 * Spec
 */
describe(StyleguideRepository.className, function()
{
    beforeEach(function()
    {
        fixtures = styleguide.createFixture();
        fixtures.rootPage = new StyleguidePage(
        {
            label: 'styleguide',
            path: '',
            children:
            [
                {
                    label: 'design',
                    children:
                    [
                        {
                            label: 'colors',
                        },
                        {
                            label: 'typo'
                        }
                    ]
                },
                {
                    label: 'modules',
                    children:
                    [
                        {
                            label: 'buttons',
                        }
                    ]
                }
            ]
        });
        fixtures.context = new Context(fixtures.configuration);
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
    });


    describe('#className', function()
    {
        xit('should return the namespaced class name', function()
        {
            const testee = new StyleguideRepository(fixtures.rootPage, fixtures.entitiesRepository);
            expect(testee.className).to.be.equal('model.styleguide/StyleguideRepository');
        });
    });


    describe('#findPageByUrl', function()
    {
        xit('should find the root page', function(cb)
        {
            const testee = new StyleguideRepository(fixtures.rootPage, fixtures.entitiesRepository);
            testee.findPageByUrl('/').then(function(page)
            {
                expect(page.url).to.be.equal('/');
                expect(page.label).to.be.equal('styleguide');
                cb();
            });
        });

        xit('should find a page at level 1', function(cb)
        {
            const testee = new StyleguideRepository(fixtures.rootPage, fixtures.entitiesRepository);
            testee.findPageByUrl('/design').then(function(page)
            {
                expect(page.url).to.be.equal('/design');
                expect(page.label).to.be.equal('design');
                cb();
            });
        });

        xit('should find a page at level 2', function(cb)
        {
            const testee = new StyleguideRepository(fixtures.rootPage, fixtures.entitiesRepository);
            testee.findPageByUrl('/design/typo').then(function(page)
            {
                expect(page.url).to.be.equal('/design/typo');
                expect(page.label).to.be.equal('typo');
                cb();
            });
        });
    });


    describe('#findDocumentationBy', function()
    {
        xit('should find documentation by contentType (sass, jinja, ...)', function()
        {
            return fixtures.context.load().then(function()
            {
                const testee = new StyleguideRepository(fixtures.rootPage, fixtures.context.di.create(EntitiesRepository));
                return testee.findDocumentationBy({ contentType: ContentType.SASS }).then(function(documentation)
                {
                    expect(documentation).to.have.length(6);
                    expect(documentation.find(item => item.name == '$color-green')).to.be.instanceof(DocumentationVariable);
                    expect(documentation.find(item => item.name == '.typo--h1')).to.be.instanceof(DocumentationClass);
                });
            });
        });

        xit('should find documentation by class (DocumentationVariable, ...)', function()
        {
            return fixtures.context.load().then(function()
            {
                const testee = new StyleguideRepository(fixtures.rootPage, fixtures.context.di.create(EntitiesRepository));
                return testee.findDocumentationBy({ class: DocumentationVariable }).then(function(documentation)
                {
                    expect(documentation).to.have.length(3);
                    expect(documentation.find(item => item.name == '$color-green')).to.be.instanceof(DocumentationVariable);
                    expect(documentation.find(item => item.name == '$breakpoint-desktop')).to.be.instanceof(DocumentationVariable);
                });
            });
        });

/*
        it('should find documentation by entityId as a string', function()
        {
            return fixtures.context.initialize().then(function()
            {
                var testee = new StyleguideRepository(fixtures.rootPage, fixtures.context.di.create(EntitiesRepository));
                return testee.findDocumentationBy({ entityId: '/default/global' }).then(function(documentation)
                {
                    expect(documentation).to.have.length(6);
                    expect(documentation.find(item => item.name == '$color-green')).to.be.instanceof(DocumentationVariable);
                    expect(documentation.find(item => item.name == '.typo--h1')).to.be.instanceof(DocumentationClass);
                });
            });
        });
*/
    });
});
