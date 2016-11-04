'use strict';

/**
 * Requirements
 */
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const nunjucks = require('nunjucks');
const sinon = require('sinon');


/**
 * Shared BaseFilter spec
 */
function spec(type, className, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className, prepareParameters);


    /**
     * BaseFilter Test
     */
    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    beforeEach(function()
    {
        fixtures = {};
        fixtures.environment = new nunjucks.Environment(undefined, { autoescape: false });
    });


    describe('#register()', function()
    {
        it('should register the filter as #name', function()
        {
            const testee = createTestee();
            expect(testee.register()).to.be.not.ok;
            expect(testee.register(fixtures.environment)).to.be.ok;
            expect(fixtures.environment.getFilter(testee.name)).to.be.ok;
        });
    });

    describe('#filter()', function()
    {
        it('should return a filter function', function()
        {
            const testee = createTestee();
            expect(testee.filter()).to.be.instanceof(Function);
        });
    });
};

/**
 * Exports
 */
module.exports = spec;
