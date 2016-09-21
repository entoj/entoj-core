"use strict";

/**
 * Requirements
 */
let ImageUrlFilter = require(SOURCE_ROOT + '/nunjucks/filter/ImageUrlFilter.js').ImageUrlFilter;
let nunjucks = require('nunjucks');
let baseSpec = require('../../BaseShared.js').spec;


/**
 * Spec
 */
describe(ImageUrlFilter.className, function()
{
    baseSpec(ImageUrlFilter, 'nunjucks.filter/ImageUrlFilter', function(parameters)
    {
        parameters.unshift(fixtures.environment);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = {};
        fixtures.environment = new nunjucks.Environment();
    });


    describe('#execute', function()
    {
        it('should return a image url for the given filename', function()
        {
            let testee = new ImageUrlFilter(fixtures.environment);
            expect(testee.execute()(false, 'test.png')).to.contain('/images/test.png/0/0/0');
        });

        it('should allow to specify width, height and force', function()
        {
            let testee = new ImageUrlFilter(fixtures.environment);
            expect(testee.execute()(false, 'test.png', 200, 200, 1)).to.contain('/images/test.png/200/200/1');
        });
    });
});
