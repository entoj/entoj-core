'use strict';

/**
 * Requirements
 */
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const baseParserSpec = require(TEST_ROOT + '/transformer/BaseParserShared.js');
const glob = require('glob');
const fs = require('fs');
const co = require('co');


/**
 * Spec
 */
describe(Parser.className, function()
{
    /**
     * Base Test
     */
    baseParserSpec(Parser, 'transformer/Parser');


    /**
     * Parser Test
     */
    function testFixture(name)
    {
        const promise = co(function*()
        {
            const rootPath = FIXTURES_ROOT + '/Transformer/';
            const input = fs.readFileSync(rootPath + name + '.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const expected = JSON.parse(fs.readFileSync(rootPath + 'Parser/' + name + '.expected.json', { encoding: 'utf8' }));
            const testee = new Parser();
            const node = yield testee.parse(input);
            try
            {
                expect(node.serialize()).to.be.deep.equal(expected);
            }
            catch(e)
            {
                console.log(JSON.stringify(node.serialize(), null, 4));
                throw e;
            }
        });
        return promise;
    }


    describe('#parse()', function()
    {
        it('should parse embedded variables', function()
        {
            return testFixture('variables');
        });

        it('should parse set tags', function()
        {
            return testFixture('set');
        });

        it('should parse macro calls', function()
        {
            return testFixture('calls');
        });

        it('should parse flow tags (if, for)', function()
        {
            return testFixture('flow');
        });

        it('should parse filters', function()
        {
            return testFixture('filter');
        });

        it('should parse conditions', function()
        {
            return testFixture('condition');
        });

        it('should parse macros', function()
        {
            return testFixture('macro');
        });
    });


    xdescribe('#parse()', function()
    {
        it('check', function()
        {
            return testFixture('macro');
        })
    });
});
