"use strict";

/**
 * Requirements
 */
const File = require(SOURCE_ROOT + '/model/file/File.js').File;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const PATH_SEPERATOR = require('path').sep;
const isWin32 = (process.platform == 'win32');


/**
 * Spec
 */
describe(File.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#constructor()', function()
    {
        it('should allow to configure a filename', function()
        {
            const testee = new File('/tmp/file.ext');
            expect(testee.filename).to.endWith(PATH_SEPERATOR + 'tmp' + PATH_SEPERATOR + 'file.ext');
        });

        it('should allow to configure a contentType', function()
        {
            const testee = new File(undefined, ContentType.SASS);
            expect(testee.contentType).to.equal(ContentType.SASS);
        });

        it('should allow to configure a contentKind', function()
        {
            const testee = new File(undefined, undefined, ContentKind.JS);
            expect(testee.contentKind).to.equal(ContentKind.JS);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new File();
            expect(testee.className).to.be.equal('model.file/File');
        });
    });


    describe('#toString()', function()
    {
        it('should return a string representation that reflects its state', function()
        {
            const testee = new File(__filename);
            expect(testee.toString()).to.be.equal('[model.file/File ' + __filename + ']');
        });
    });


    describe('#contentKind', function()
    {
        it('should have ContentKind.UNKNOWN as a default', function()
        {
            let testee = new File();
            expect(testee.contentKind).to.equal(ContentKind.UNKNOWN);
        });


        it('should allow to set a content kind', function()
        {
            const testee = new File();
            testee.contentKind = ContentKind.EXAMPLE;
            expect(testee.contentKind).to.equal(ContentKind.EXAMPLE);
        });
    });


    describe('#contentType', function()
    {
        it('should have ContentType.ANY as a default', function()
        {
            const testee = new File();
            expect(testee.contentType).to.equal(ContentType.ANY);
        });


        it('should allow to set a content type', function()
        {
            const testee = new File();
            testee.contentType = ContentType.JINJA;
            expect(testee.contentType).to.equal(ContentType.JINJA);
        });
    });


    describe('#filename', function()
    {
        it('should allow to get & set a filename', function()
        {
            const testee = new File();
            testee.filename = '/tmp/file/name.ext';
            expect(testee.filename).to.endWith(PATH_SEPERATOR + 'tmp' + PATH_SEPERATOR + 'file' + PATH_SEPERATOR + 'name.ext');
        });

        if (isWin32)
        {
            it('should allow to get & set a windows filename', function()
            {
                const testee = new File();
                testee.filename = 'C:\\tmp\\file\\name.ext';
                expect(testee.filename).to.endWith(PATH_SEPERATOR + 'tmp' + PATH_SEPERATOR + 'file' + PATH_SEPERATOR + 'name.ext');
            });
        }
    });


    describe('#contents', function()
    {
        it('should allow to get & set the file contents', function()
        {
            const testee = new File();
            testee.contents = 'Content';
            expect(testee.contents).to.be.equal('Content');
        });

        it('should read file contents when not explicitly set', function()
        {
            const testee = new File();
            testee.filename = __filename;
            expect(testee.contents).to.have.string('File.className');
        });
    });


    describe('#path', function()
    {
        it('should allow to get the path of filename', function()
        {
            const testee = new File('/tmp/file/name.ext');
            expect(testee.path).to.endWith(PATH_SEPERATOR + 'tmp' + PATH_SEPERATOR + 'file');
        });
    });


    describe('#basename', function()
    {
        it('should allow to get the basename of filename', function()
        {
            const testee = new File('/tmp/file/name.ext');
            expect(testee.basename).to.be.equal('name.ext');
        });
    });


    describe('#extension', function()
    {
        it('should allow to get the extension of filename', function()
        {
            const testee = new File('/tmp/file/name.ext');
            expect(testee.extension).to.be.equal('.ext');
        });
    });
});
