"use strict";

/**
 * Requirements
 */
const FileParser = require(SOURCE_ROOT + '/parser/FileParser.js').FileParser;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const co = require('co');
const sinon = require('sinon');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(FileParser.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor', function()
    {
        it('should allow to configure glob, fileType and fileKind via options', function()
        {
            const testee = new FileParser({ fileType: 'foo', fileKind: 'bar', glob:['baz'] });
            expect(testee.fileType).to.be.equal('foo');
            expect(testee.fileKind).to.be.equal('bar');
            expect(testee.glob).to.be.contain('baz');
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new FileParser();
            expect(testee.className).to.be.equal('parser/FileParser');
        });
    });


    describe('#parse', function()
    {
        it('should parse each file that is matched by the given glob and root path', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const glob = ['/*.j2', '/macros/*.j2'];
                const testee = new FileParser();
                sinon.spy(testee, 'parseFile');
                const result = yield testee.parse(root, { glob: glob });
                expect(testee.parseFile.calledTwice).to.be.ok;
            });
            return promise;
        });

        it('should resolve to an object containing all parsed files', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const glob = ['/*.j2', '/macros/*.j2'];
                const testee = new FileParser();
                const result = yield testee.parse(root, { glob: glob });
                expect(result).to.be.ok;
                expect(result.files).to.have.length(2);
                expect(result.files.find(file => file.basename == 'm001-gallery.j2')).to.be.ok;
                expect(result.files.find(file => file.basename == 'm001-gallery.j2').contentType).to.be.equal(ContentType.ANY);
                expect(result.files.find(file => file.basename == 'm001-gallery.j2').contentKind).to.be.equal(ContentKind.UNKNOWN);
                expect(result.files.find(file => file.basename == 'helper.j2')).to.be.ok;
            });
            return promise;
        });
    });
});