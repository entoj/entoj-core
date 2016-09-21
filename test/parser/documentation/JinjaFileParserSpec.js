"use strict";

/**
 * Requirements
 */
const JinjaFileParser = require(SOURCE_ROOT + '/parser/documentation/JinjaFileParser.js').JinjaFileParser;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const co = require('co');
const sinon = require('sinon');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(JinjaFileParser.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor', function()
    {
        it('should allow to configure glob, fileType and fileKind via options', function()
        {
            const testee = new JinjaFileParser({ fileType: 'foo', fileKind: 'bar', glob:['baz'] });
            expect(testee.fileType).to.be.equal('foo');
            expect(testee.fileKind).to.be.equal('bar');
            expect(testee.glob).to.be.contain('baz');
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new JinjaFileParser();
            expect(testee.className).to.be.equal('parser.documentation/JinjaFileParser');
        });
    });


    describe('#parse', function()
    {
        it('should parse each jinja file that matches the glob patterns', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const testee = new JinjaFileParser();
                const result = yield testee.parse(root);
                expect(result.files).to.have.length(2);
                expect(result.files.find(file => file.basename == 'm001-gallery.j2')).to.be.ok;
                expect(result.files.find(file => file.basename == 'm001-gallery.j2').contentType).to.be.equal(ContentType.JINJA);
                expect(result.files.find(file => file.basename == 'm001-gallery.j2').contentKind).to.be.equal(ContentKind.MACRO);
                expect(result.files.find(file => file.basename == 'helper.j2')).to.be.ok;
                expect(result.files.find(file => file.basename == 'helper.j2').contentType).to.be.equal(ContentType.JINJA);
                expect(result.files.find(file => file.basename == 'helper.j2').contentKind).to.be.equal(ContentKind.MACRO);
                expect(result.items).to.have.length(3);
            });
            return promise;
        });
    });
});