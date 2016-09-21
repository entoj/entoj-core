"use strict";

/**
 * Requirements
 */
const MarkdownFileParser = require(SOURCE_ROOT + '/parser/documentation/MarkdownFileParser.js').MarkdownFileParser;
const DocumentationText = require(SOURCE_ROOT + '/model/documentation/DocumentationText.js').DocumentationText;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const co = require('co');
const sinon = require('sinon');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(MarkdownFileParser.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor', function()
    {
        it('should allow to configure glob, fileType and fileKind via options', function()
        {
            const testee = new MarkdownFileParser({ fileType: 'foo', fileKind: 'bar', glob:['baz'] });
            expect(testee.fileType).to.be.equal('foo');
            expect(testee.fileKind).to.be.equal('bar');
            expect(testee.glob).to.be.contain('baz');
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new MarkdownFileParser();
            expect(testee.className).to.be.equal('parser.documentation/MarkdownFileParser');
        });
    });


    describe('#parse', function()
    {
        it('should parse each markdown file that matches the glob patterns', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const testee = new MarkdownFileParser();
                const result = yield testee.parse(root);
                expect(result.files).to.have.length(1);
                expect(result.files.find(file => file.basename == 'm001-gallery.md')).to.be.ok;
                expect(result.files.find(file => file.basename == 'm001-gallery.md').contentType).to.be.equal(ContentType.MARKDOWN);
                expect(result.files.find(file => file.basename == 'm001-gallery.md').contentKind).to.be.equal(ContentKind.TEXT);
            });
            return promise;
        });

        it('should set the documentation name to the file basename', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const testee = new MarkdownFileParser();
                const result = yield testee.parse(root);
                expect(result.items).to.have.length(1);
                expect(result.items.find(doc => doc.name == 'm001-gallery.md')).to.be.ok;
            });
            return promise;
        });
    });
});