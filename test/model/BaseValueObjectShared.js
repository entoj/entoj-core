"use strict";

/**
 * Requirements
 * @ignore
 */
let create = require(SOURCE_ROOT + '/utils/objects.js').create;
let baseSpec = require('../BaseShared.js').spec;
let co = require('co');


/**
 * Shared BaseLoader spec
 */
function spec(type, className, prepareParameters)
{
    let createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    baseSpec(type, className, prepareParameters);


    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#update', function()
    {
        it('should allow to update properties, documentation and files with a object', function()
        {
            let promise = co(function *()
            {
                let data =
                {
                    properties:
                    {
                        foo: 'bar'
                    },
                    documentation:
                    [
                        'foo'
                    ],
                    files:
                    [
                        'bar'
                    ]
                }
                let testee = createTestee();

                yield testee.update(data);
                expect(testee.properties.getByPath('foo')).to.be.equal('bar');
                expect(testee.documentation).to.include('foo');
                expect(testee.files).to.include('bar');
            });
            return promise;
        });

        it('should allow to update properties, documentation and files with another BaseValueObject', function()
        {
            let promise = co(function *()
            {
                let data = createTestee();
                data.properties.set('foo', 'bar');
                data.documentation.push('foo');
                data.files.push('bar');
                let testee = createTestee();

                yield testee.update(data);
                expect(testee.properties.getByPath('foo')).to.be.equal('bar');
                expect(testee.documentation).to.include('foo');
                expect(testee.files).to.include('bar');
            });
            return promise;
        });
    });
}

/**
 * Exports
 */
module.exports.spec = spec;
