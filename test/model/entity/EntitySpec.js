'use strict';

/**
 * Requirements
 */
let Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
let MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
let compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
let baseValueObjectSpec = require('../BaseValueObjectShared.js').spec;
let co = require('co');


/**
 * Spec
 */
describe(Entity.className, function()
{
    baseValueObjectSpec(Entity, 'model.entity/Entity', function(parameters)
    {
        parameters.unshift(fixtures.entityIdGallery);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a id', function()
        {
            expect(function() { new Entity(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper id type', function()
        {
            expect(function() { new Entity('Category'); }).to.throw(TypeError);
        });
    });


    describe('#update', function()
    {
        it('should allow to update id', function()
        {
            let promise = co(function *()
            {
                let data = new Entity(fixtures.entityIdGallery);
                let testee = new Entity(fixtures.entityIdButton);
                yield testee.update(data);
                expect(testee.id).to.be.equal(data.id);
            });
            return promise;
        });
    });
});