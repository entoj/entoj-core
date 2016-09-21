"use strict";

/**
 * Requirements
 */
const JsFileParser = require(SOURCE_ROOT + '/parser/documentation/JsFileParser.js').JsFileParser;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const co = require('co');
const sinon = require('sinon');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(JsFileParser.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor', function()
    {
        it('should allow to configure glob, fileType and fileKind via options', function()
        {
            const testee = new JsFileParser({ fileType: 'foo', fileKind: 'bar', glob:['baz'] });
            expect(testee.fileType).to.be.equal('foo');
            expect(testee.fileKind).to.be.equal('bar');
            expect(testee.glob).to.be.contain('baz');
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new JsFileParser();
            expect(testee.className).to.be.equal('parser.documentation/JsFileParser');
        });
    });


    describe('#parse', function()
    {
        it('should parse each sass file that matches the glob patterns', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const testee = new JsFileParser();
                const result = yield testee.parse(root);
                expect(result.files).to.have.length(2);
                expect(result.files.find(file => file.basename == 'm001-gallery.js')).to.be.ok;
                expect(result.files.find(file => file.basename == 'm001-gallery.js').contentType).to.be.equal(ContentType.JS);
                expect(result.files.find(file => file.basename == 'm001-gallery.js').contentKind).to.be.equal(ContentKind.JS);
                expect(result.files.find(file => file.basename == 'm001-gallery-helper.js')).to.be.ok;
                expect(result.items).to.have.length(0);
            });
            return promise;
        });
    });
});
