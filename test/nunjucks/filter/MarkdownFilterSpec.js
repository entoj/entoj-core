"use strict";

/**
 * Requirements
 */
const MarkdownFilter = require(SOURCE_ROOT + '/nunjucks/filter/MarkdownFilter.js').MarkdownFilter;
const DocumentationTextSection = require(SOURCE_ROOT + '/model/documentation/DocumentationTextSection.js').DocumentationTextSection;
const marked = require('marked');
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');


/**
 * Spec
 */
describe(MarkdownFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(MarkdownFilter, 'nunjucks.filter/MarkdownFilter');


    /**
     * MarkdownFilter Test
     */
    describe('#filter', function()
    {
        it('should return html for a markdown string', function()
        {
            let testee = new MarkdownFilter();
            expect(testee.filter()('# Headline')).to.contain('</h1>');
            expect(testee.filter()('Copy')).to.contain('</p>');
        });

        it('should return html for markdown tokens', function()
        {
            let testee = new MarkdownFilter();
            expect(testee.filter()(marked.lexer('# Headline'))).to.contain('</h1>');
            expect(testee.filter()(marked.lexer('Cop'))).to.contain('</p>');
        });

        it('should return html for a DocumentationTextSection', function()
        {
            let section = new DocumentationTextSection();
            section.tokens = marked.lexer('# Headline');

            let testee = new MarkdownFilter();
            expect(testee.filter()(section)).to.contain('</h1>');
        });

        it('should return html for a array of DocumentationTextSection', function()
        {
            let section1 = new DocumentationTextSection();
            section1.tokens = marked.lexer('# Headline');
            let section2 = new DocumentationTextSection();
            section2.tokens = marked.lexer('Copy');
            let sections = [section1, section2];

            let testee = new MarkdownFilter();
            expect(testee.filter()(sections)).to.contain('</h1>');
            expect(testee.filter()(sections)).to.contain('</p>');
        });

        it('should allow to change headline levels via a offset', function()
        {
            let testee = new MarkdownFilter();
            expect(testee.filter()('# Headline', 1)).to.contain('</h2>');
            expect(testee.filter()('## Headline', 1)).to.contain('</h3>');
        });

        it('should keep headline levels within 1-5', function()
        {
            let testee = new MarkdownFilter();
            expect(testee.filter()('# Headline', 10)).to.contain('</h5>');
            expect(testee.filter()('## Headline', -10)).to.contain('</h1>');
        });
    });
});
