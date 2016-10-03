"use strict";

/**
 * Requirements
 */
const ImageResizer = require(SOURCE_ROOT + '/image/ImageResizer.js').ImageResizer;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const co = require('co');


/**
 * Spec
 */
describe(ImageResizer.className, function()
{
    /**
     * Base Test
     */
    baseSpec(ImageResizer, 'image/ImageResizer', function(parameters)
    {
        parameters.unshift(fixtures.pathesConfiguration);
        return parameters;
    });


    /**
     * ImageResizer Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a pathesConfiguration configuration', function()
        {
            expect(function() { new ImageResizer(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathesConfiguration type', function()
        {
            expect(function() { new ImageResizer('pathesConfiguration'); }).to.throw(TypeError);
        });
    });


    describe('#resolveImageFilename()', function()
    {
        it('should resolve to a filename when given a existing image name', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const filename = yield testee.resolveImageFilename('southpark-01.jpg');
                expect(filename).to.be.equal(pathes.concat(fixtures.pathesConfiguration.data, '/images/southpark-01.jpg'));
            });
            return promise;
        });

        it('should resolve to a random filename when given a valid glob pattern', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const expected =
            [
                pathes.concat(fixtures.pathesConfiguration.data + '/images/southpark-01.jpg'),
                pathes.concat(fixtures.pathesConfiguration.data + '/images/southpark-02.jpg')
            ];
            const promise = co(function*()
            {
                let filename;
                filename = yield testee.resolveImageFilename('southpark-*.jpg');
                expect(expected).to.include(filename);
                filename = yield testee.resolveImageFilename('southpark-*.jpg');
                expect(expected).to.include(filename);
            });
            return promise;
        });
    });


    describe('#resolveCacheFilename()', function()
    {
        it('should resolve to a filename based on all given parameters', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const cachePath = yield fixtures.pathesConfiguration.resolveCache('/images');
                const imageFilename = yield testee.resolveImageFilename('southpark-01.jpg');
                let filename;

                filename = yield testee.resolveCacheFilename(imageFilename);
                expect(filename).to.be.equal(pathes.concat(cachePath, '/0x0-false-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, 100);
                expect(filename).to.be.equal(pathes.concat(cachePath + '/100x0-false-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, undefined, 100);
                expect(filename).to.be.equal(pathes.concat(cachePath + '/0x100-false-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, undefined, undefined, true);
                expect(filename).to.be.equal(pathes.concat(cachePath + '/0x0-true-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, 1000, 2000, true);
                expect(filename).to.be.equal(pathes.concat(cachePath + '/1000x2000-true-southpark-01.jpg'));
            });
            return promise;
        });
    });


    describe('#getImageSize()', function()
    {
        it('should resolve to a object contianing the image width and height', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const imageFilename = yield testee.resolveImageFilename('southpark-01.jpg');
                const size = yield testee.getImageSize(imageFilename);
                expect(size).to.be.deep.equal({ width: 960, height: 540 });
            });
            return promise;
        });
    });


    describe('#getImageSettings()', function()
    {
        it('should resolve to a object containing the image width and height', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const imageFilename = yield testee.resolveImageFilename('southpark-01.jpg');
                const size = yield testee.getImageSettings(imageFilename);
                expect(size.width).to.be.equal(960);
                expect(size.height).to.be.equal(540);
            });
            return promise;
        });

        it('should add a default focal point', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const imageFilename = yield testee.resolveImageFilename('southpark-01.jpg');
                const settings = yield testee.getImageSettings(imageFilename);
                expect(settings.focal.x).to.be.equal(0);
                expect(settings.focal.y).to.be.equal(0);
                expect(settings.focal.width).to.be.equal(960);
                expect(settings.focal.height).to.be.equal(540);
            });
            return promise;
        });

        it('should read a json file with the same name as the image that contains the focal point', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const imageFilename = yield testee.resolveImageFilename('southpark-02.jpg');
                const settings = yield testee.getImageSettings(imageFilename);
                expect(settings.focal.x).to.be.equal(652);
                expect(settings.focal.y).to.be.equal(176);
                expect(settings.focal.width).to.be.equal(342);
                expect(settings.focal.height).to.be.equal(325);
            });
            return promise;
        });
    });


    describe('#calculateArea()', function()
    {
        it('should resolve to a object containing  x, y, width and height of the area', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const settings =
                {
                    width: 500,
                    height: 500,
                    focal:
                    {
                        x: 250,
                        y: 250,
                        width: 100,
                        height: 100
                    }
                };
                const area = yield testee.calculateArea(200, 100, '1', settings);
                expect(area.x).to.be.defined;
                expect(area.y).to.be.defined;
                expect(area.width).to.be.defined;
                expect(area.height).to.be.defined;
            });
            return promise;
        });

        it('should keep the focal area visible', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const settings =
                {
                    width: 500,
                    height: 500,
                    focal:
                    {
                        x: 250,
                        y: 250,
                        width: 100,
                        height: 100
                    }
                };
                const area = yield testee.calculateArea(200, 100, '1', settings);
                expect(area.x).to.be.below(settings.focal.x);
                expect(area.y).to.be.below(settings.focal.y);
                expect(area.width).to.be.above(settings.focal.width - 1);
                expect(area.height).to.be.above(settings.focal.height - 1);
            });
            return promise;
        });
    });


    describe('#resizeForced()', function()
    {
        it('should create a image with given dimensions when forced', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const filename = yield testee.resizeForced('southpark-02.png', 300, 200, '1');
                const size = yield testee.getImageSize(filename);
                expect(size.width).to.be.equal(300);
                expect(size.height).to.be.equal(200);
            });
            return promise;
        });
    });


    describe('#resizeUnforced()', function()
    {
        it('should create a image with given dimensions', function()
        {
            const testee = new ImageResizer(fixtures.pathesConfiguration);
            const promise = co(function*()
            {
                const filename = yield testee.resizeUnforced('southpark-02.png', 100, 100);
                const size = yield testee.getImageSize(filename);
                expect(size.width).to.be.below(100 + 1);
                expect(size.height).to.be.below(100 + 1);
            });
            return promise;
        });
    });
});
