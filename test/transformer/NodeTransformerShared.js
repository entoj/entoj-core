'use strict';

/**
 * Requirements
 */
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const fs = require('fs');
const co = require('co');


/**
 * Shared NodeTransformer spec
 */
function spec(type, className, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className, prepareParameters);


    /**
     * NodeTransformer Test
     */
    function createTestee(classType, prepareParameters, ...params)
    {
        let parameters = Array.from(params);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(classType || type, parameters);
    }


    /**
     * Loads a fixture
     */
    function loadFixture(name)
    {
        const promise = co(function *()
        {
            const rootPath = FIXTURES_ROOT + '/Transformer/NodeTransformer/';
            const input = fs.readFileSync(rootPath + name + '.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const expected = JSON.parse(fs.readFileSync(rootPath + name + '.expected.json', { encoding: 'utf8' }));
            const parser = new Parser();
            const rootNode = yield parser.parse(input);
            return { rootNode: rootNode, expected: expected };
        });
        return promise;
    }
    spec.loadFixture = loadFixture;


    /**
     * Loads a fixture and compares the transformed result to expected
     */
    function testFixture(name, classType, prepareParameters)
    {
        const promise = co(function *()
        {
            const fixture = yield loadFixture(name);
            const testee = createTestee(classType, prepareParameters);
            const transformed = yield testee.transform(fixture.rootNode);
            try
            {
                expect(transformed.serialize()).to.be.deep.equal(fixture.expected);
            }
            catch(e)
            {
                console.log('Parsed:');
                console.log(JSON.stringify(fixture.rootNode.serialize(), null, 4));
                console.log('Expected:');
                console.log(JSON.stringify(fixture.expected, null, 4));
                console.log('Transformed:');
                console.log(JSON.stringify(transformed.serialize(), null, 4));
                throw e;
            }
        });
        return promise;
    }
    spec.testFixture = testFixture;


    describe('#transform()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee(type, prepareParameters);
            const promise = testee.transform();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should visit all nodes and clone them', function()
        {
            const promise = co(function *()
            {
                const fixture = yield loadFixture('NodeTransformer');
                const testee = createTestee(type, prepareParameters);
                const transformed = yield testee.transform(fixture.rootNode);

                // Shoud be new objects
                expect(transformed).to.be.not.deep.equal(fixture.rootNode);

                // Shoud have the same structure
                expect(transformed.serialize()).to.be.deep.equal(fixture.rootNode.serialize());
            });
            return promise;
        });
    });
};

/**
 * Exports
 */
module.exports = spec;
