"use strict";

/**
 * Requirements
 */
const MarkdownFilter = require(SOURCE_ROOT + '/nunjucks/filter/MarkdownFilter.js').MarkdownFilter;
const DocumentationTextSection = require(SOURCE_ROOT + '/model/documentation/DocumentationTextSection.js').DocumentationTextSection;
const nunjucks = require('nunjucks');
const marked = require('marked');


/**
 * Spec
 */
describe(MarkdownFilter.className, function()
{
    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new MarkdownFilter(new nunjucks.Environment());
            expect(testee.className).to.be.equal('nunjucks.filter/MarkdownFilter');
        });
    });


    describe('#execute', function()
    {
        it('should return html for a markdown string', function()
        {
            let testee = new MarkdownFilter(new nunjucks.Environment());
            expect(testee.execute()('# Headline')).to.contain('</h1>');
            expect(testee.execute()('Copy')).to.contain('</p>');
        });

        it('should return html for markdown tokens', function()
        {
            let testee = new MarkdownFilter(new nunjucks.Environment());
            expect(testee.execute()(marked.lexer('# Headline'))).to.contain('</h1>');
            expect(testee.execute()(marked.lexer('Cop'))).to.contain('</p>');
        });

        it('should return html for a DocumentationTextSection', function()
        {
            let section = new DocumentationTextSection();
            section.tokens = marked.lexer('# Headline');

            let testee = new MarkdownFilter(new nunjucks.Environment());
            expect(testee.execute()(section)).to.contain('</h1>');
        });

        it('should return html for a array of DocumentationTextSection', function()
        {
            let section1 = new DocumentationTextSection();
            section1.tokens = marked.lexer('# Headline');
            let section2 = new DocumentationTextSection();
            section2.tokens = marked.lexer('Copy');
            let sections = [section1, section2];

            let testee = new MarkdownFilter(new nunjucks.Environment());
            expect(testee.execute()(sections)).to.contain('</h1>');
            expect(testee.execute()(sections)).to.contain('</p>');
        });

        it('should allow to change headline levels via a offset', function()
        {
            let testee = new MarkdownFilter(new nunjucks.Environment());
            expect(testee.execute()('# Headline', 1)).to.contain('</h2>');
            expect(testee.execute()('## Headline', 1)).to.contain('</h3>');
        });

        it('should keep headline levels within 1-5', function()
        {
            let testee = new MarkdownFilter(new nunjucks.Environment());
            expect(testee.execute()('# Headline', 10)).to.contain('</h5>');
            expect(testee.execute()('## Headline', -10)).to.contain('</h1>');
        });
    });
});
