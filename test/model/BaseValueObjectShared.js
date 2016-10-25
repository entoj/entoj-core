"use strict";

/**
 * Requirements
 * @ignore
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require('../BaseShared.js').spec;
const co = require('co');


/**
 * Shared BaseValueObject spec
 */
function spec(type, className, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className, prepareParameters);


    /**
     * BaseValueObject Test
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


    describe('#update', function()
    {
        it('should allow to update properties, documentation and files with a object', function()
        {
            const promise = co(function *()
            {
                const data =
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
                const testee = createTestee();

                yield testee.update(data);
                expect(testee.properties.getByPath('foo')).to.be.equal('bar');
                expect(testee.documentation).to.include('foo');
                expect(testee.files).to.include('bar');
            });
            return promise;
        });

        it('should allow to update properties, documentation and files with another BaseValueObject', function()
        {
            const promise = co(function *()
            {
                const data = createTestee();
                data.properties.set('foo', 'bar');
                data.documentation.push('foo');
                data.files.push('bar');
                const testee = createTestee();

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
module.exports = spec;
module.exports.spec = spec;
