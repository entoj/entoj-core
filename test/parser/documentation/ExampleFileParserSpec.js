"use strict";

/**
 * Requirements
 */
const ExampleFileParser = require(SOURCE_ROOT + '/parser/documentation/ExampleFileParser.js').ExampleFileParser;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const co = require('co');
const sinon = require('sinon');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');

/**
 * Spec
 */
describe(ExampleFileParser.className, function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor', function()
    {
        it('should allow to configure glob, fileType and fileKind via options', function()
        {
            const testee = new ExampleFileParser({ fileType: 'foo', fileKind: 'bar', glob:['baz'] });
            expect(testee.fileType).to.be.equal('foo');
            expect(testee.fileKind).to.be.equal('bar');
            expect(testee.glob).to.be.contain('baz');
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new ExampleFileParser();
            expect(testee.className).to.be.equal('parser.documentation/ExampleFileParser');
        });
    });


    describe('#parse', function()
    {
        it('should parse each example file that matches the glob patterns', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const testee = new ExampleFileParser();
                const result = yield testee.parse(root);
                expect(result.files).to.have.length(2);
                expect(result.files.find(file => file.basename == 'default.j2')).to.be.ok;
                expect(result.files.find(file => file.basename == 'default.j2').contentType).to.be.equal(ContentType.JINJA);
                expect(result.files.find(file => file.basename == 'default.j2').contentKind).to.be.equal(ContentKind.EXAMPLE);
                expect(result.files.find(file => file.basename == 'hero.j2')).to.be.ok;
                expect(result.files.find(file => file.basename == 'hero.j2').contentType).to.be.equal(ContentType.JINJA);
                expect(result.files.find(file => file.basename == 'hero.j2').contentKind).to.be.equal(ContentKind.EXAMPLE);
            });
            return promise;
        });

        it('should set the documentation name to the file basename', function()
        {
            let promise = co(function*()
            {
                const root = yield fixtures.pathes.resolveEntity(fixtures.entityGallery);
                const testee = new ExampleFileParser();
                const result = yield testee.parse(root);
                expect(result.items).to.have.length(2);
                expect(result.items.find(doc => doc.name == 'default.j2')).to.be.ok;
                expect(result.items.find(doc => doc.name == 'hero.j2')).to.be.ok;
            });
            return promise;
        });
    });
});