'use strict';

/**
 * Requirements
 */
let Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
let MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
let baseValueObjectSpec = require('../BaseValueObjectShared.js').spec;
let co = require('co');


/**
 * Spec
 */
describe(Site.className, function()
{
    baseValueObjectSpec(Site, 'model.site/Site', function(parameters)
    {
        parameters.unshift('base');
        return parameters;
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a name', function()
        {
            expect(function() { new Site(); }).to.throw(MissingArgumentError);
        });

        it('should allow to configure name and description', function()
        {
            const testee = new Site('base', 'Default template');

            expect(testee.name).to.equal('base');
            expect(testee.description).to.equal('Default template');
        });
    });


    describe('#uniqueId', function()
    {
        it('should return the site name', function()
        {
            let testee = new Site('base');
            expect(testee.uniqueId).to.be.equal('base');
        });
    });


    describe('#isEqualTo', function()
    {
        it('should return true when both sites have the same name', function()
        {
            let testee = new Site('base');
            let other = new Site('base');
            expect(testee.isEqualTo(testee)).to.be.ok;
        });

        it('should return false when both objects dont have the same name', function()
        {
            let testee = new Site('base');
            let other = new Site('landingpage');
            expect(testee.isEqualTo(other)).to.be.not.ok;
        });
    });


    describe('#update', function()
    {
        it('should allow to update name', function()
        {
            let promise = co(function *()
            {
                let data = new Site('base');
                let testee = new Site('landingpage');
                yield testee.update(data);
                expect(testee.name).to.be.equal(data.name);
            });
            return promise;
        });
    });
});