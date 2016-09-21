"use strict";

/**
 * Requirements
 */
const DocumentationBase = require(SOURCE_ROOT + '/model/documentation/DocumentationBase.js').DocumentationBase;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require('../../BaseShared.js').spec;


/**
 * Shared DocumentationBase Spec
 */
function spec(type, className, prepareParameters)
{
    baseSpec(type, className, prepareParameters);


    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };

    const testProperty = function(name, defaultValue, testValue)
    {
        const value = typeof testValue === 'undefined' ? 'TESTVALUE' : testValue;

        it('should have a default value of ' + defaultValue.label, function()
        {
            const testee = createTestee();
            expect(testee[name]).to.be.equal(defaultValue.value);
        });

        it('should be writable', function()
        {
            const testee = createTestee();
            testee[name] = value;
            expect(testee[name]).to.be.equal(value);
        });
    };


    describe('#contentKind', function()
    {
        testProperty('contentKind', { label: 'ContentKind.UNKNOWN', value: ContentKind.UNKNOWN }, ContentKind.CSS);
    });


    describe('#contentType', function()
    {
        testProperty('contentType', { label: 'ContentType.ANY', value: ContentType.ANY }, ContentType.SASS);
    });


    describe('#site', function()
    {
        testProperty('site', { label: 'false', value: false });
    });

    describe('#file', function()
    {
        testProperty('file', { label: 'false', value: false });
    });

    describe('#group', function()
    {
        testProperty('group', { label: '\'\'', value: '' });
    });

    describe('#tags', function()
    {
        //testProperty('tags', { label: 'Array', value: [] });
    });

}

/**
 * Exports
 */
module.exports.spec = spec;
