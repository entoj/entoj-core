'use strict';

/**
 * Requirements
 */
let EntityCategory = require(SOURCE_ROOT + '/model/entity/EntityCategory.js').EntityCategory;
let MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
let baseValueObjectSpec = require('../BaseValueObjectShared.js').spec;
let co = require('co');


/**
 * Spec
 */
describe(EntityCategory.className, function()
{
    baseValueObjectSpec(EntityCategory, 'model.entity/EntityCategory', function(parameters)
    {
        parameters.unshift('base');
        return parameters;
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a longName', function()
        {
            expect(function() { new EntityCategory(); }).to.throw(MissingArgumentError);
        });

        it('should allow to configure shortName, longName, pluralName and isGlobal', function()
        {
            let testee = new EntityCategory('Module', 'Modules', 'm', true);

            expect(testee.longName).to.equal('Module');
            expect(testee.pluralName).to.equal('Modules');
            expect(testee.shortName).to.equal('m');
            expect(testee.isGlobal).to.ok;
        });

        it('should derive short from long name if not given', function()
        {
            let testee = new EntityCategory('Element');

            expect(testee.shortName).to.equal('e');
        });

        it('should derive plural from long name if not given', function()
        {
            let testee = new EntityCategory('Element');

            expect(testee.pluralName).to.equal('Elements');
        });
    });


    describe('#update', function()
    {
        it('should allow to update longName, pluralName, shortName and isGlobal', function()
        {
            let promise = co(function *()
            {
                let data = new EntityCategory('Element');
                let testee = new EntityCategory('Module');
                yield testee.update(data);
                expect(testee.longName).to.be.equal(data.longName);
                expect(testee.pluralName).to.be.equal(data.pluralName);
                expect(testee.shortName).to.be.equal(data.shortName);
                expect(testee.isGlobal).to.be.equal(data.isGlobal);
            });
            return promise;
        });
    });
});