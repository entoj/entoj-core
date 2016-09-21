"use strict";

/**
 * Requirements
 */
const DocumentationArray = require(SOURCE_ROOT + '/model/documentation/DocumentationArray.js').DocumentationArray;
const DocumentationCallable = require(SOURCE_ROOT + '/model/documentation/DocumentationCallable.js').DocumentationCallable;
const DocumentationText = require(SOURCE_ROOT + '/model/documentation/DocumentationText.js').DocumentationText;
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
const co = require('co');


/**
 * Spec
 */
describe(DocumentationArray.className, function()
{
    beforeEach(function()
    {
        let promise = co(function *()
            {
                fixtures = {};

                fixtures.documentationArray = new DocumentationArray();

                fixtures.documentationCallable = new DocumentationCallable();
                fixtures.documentationCallable.name = 'Callable';
                fixtures.documentationCallable.contentKind = ContentKind.MACRO;

                fixtures.documentationArray.push(fixtures.documentationCallable);
            });
        return promise;
    });

    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new DocumentationArray();
            expect(testee.className).to.be.equal('model.documentation/DocumentationArray');
        });
    });

    describe('#getByType', function()
    {
        it('should return all docs of given type', function()
        {
            const testee = fixtures.documentationArray;
            const promise = co(function *()
                {
                    const docs = yield testee.getByType(DocumentationCallable);
                    expect(docs).to.have.length(1);
                    expect(docs.find(item => item.name == 'Callable')).to.be.ok;
                });
            return promise;
        });

        it('should return all docs of given type name', function()
        {
            const testee = fixtures.documentationArray;
            const promise = co(function *()
                {
                    const docs = yield testee.getByType('DocumentationCallable');
                    expect(docs).to.have.length(1);
                    expect(docs.find(item => item.name == 'Callable')).to.be.ok;
                });
            return promise;
        });
    });


    describe('#getByContentKind', function()
    {
        it('should return all docs of given ContentKind', function()
        {
            const testee = fixtures.documentationArray;
            const promise = co(function *()
                {
                    const docs = yield testee.getByContentKind(ContentKind.MACRO);
                    expect(docs).to.have.length(1);
                    expect(docs.find(item => item.name == 'Callable')).to.be.ok;
                });
            return promise;
        });

        it('should return all docs of given ContentKind name', function()
        {
            const testee = fixtures.documentationArray;
            const promise = co(function *()
                {
                    const docs = yield testee.getByContentKind('MACRO');
                    expect(docs).to.have.length(1);
                    expect(docs.find(item => item.name == 'Callable')).to.be.ok;
                });
            return promise;
        });
    });
});
