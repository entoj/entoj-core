'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require(SOURCE_ROOT + '/Base.js').Base;
const intel = require('intel');
const create = require(SOURCE_ROOT + '/utils/objects.js').create;


/**
 * Spec
 */
function spec(type, className, prepareParameters)
{
    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    describe('.className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = type;
            expect(testee.className).to.be.equal(className);
        });
    });


    describe('.injections', function()
    {
        it('should return dependecies', function()
        {
            const testee = type;
            expect(testee.injections).to.be.ok;
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = createTestee();
            expect(testee.className).to.be.equal(className);
        });
    });


    describe('#instanceId', function()
    {
        it('should return a unique instance id', function()
        {
            const testee = createTestee();
            const other = createTestee();
            expect(testee.instanceId).to.be.ok;
            expect(other.instanceId).to.be.ok;
            expect(testee.instanceId).to.be.not.equal(other.instanceId);
        });
    });


    describe('#logger', function()
    {
        it('should return a intel logger instance', function()
        {
            const testee = createTestee();
            expect(testee.logger).to.be.instanceOf(intel.Logger);
        });
    });


    describe('#toString()', function()
    {
        it('should return a string representation that contains the class name', function()
        {
            const testee = createTestee();
            expect(testee.toString()).to.contain(className);
        });
    });
};


/**
 * Api
 * @ignore
 */
module.exports = spec;
module.exports.spec = spec;
