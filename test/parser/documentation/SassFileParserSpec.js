"use strict";

/**
 * Requirements
 */
const SassFileParser = require(SOURCE_ROOT + '/parser/documentation/SassFileParser.js').SassFileParser;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const co = require('co');
const sinon = require('sinon');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(SassFileParser.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor', function()
    {
        it('should allow to configure glob, fileType and fileKind via options', function()
        {
            const testee = new SassFileParser({ fileType: 'foo', fileKind: 'bar', glob:['baz'] });
            expect(testee.fileType).to.be.equal('foo');
            expect(testee.fileKind).to.be.equal('bar');
            expect(testee.glob).to.be.contain('baz');
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new SassFileParser();
            expect(testee.className).to.be.equal('parser.documentation/SassFileParser');
        });
    });


    describe('#parse', function()
    {
        it('should parse each sass file that matches the glob patterns', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const testee = new SassFileParser();
                const result = yield testee.parse(root);
                expect(result.files).to.have.length(1);
                expect(result.files.find(file => file.basename == 'm001-gallery.scss')).to.be.ok;
                expect(result.files.find(file => file.basename == 'm001-gallery.scss').contentType).to.be.equal(ContentType.SASS);
                expect(result.files.find(file => file.basename == 'm001-gallery.scss').contentKind).to.be.equal(ContentKind.CSS);
                expect(result.items).to.have.length(1);
            });
            return promise;
        });
    });
});