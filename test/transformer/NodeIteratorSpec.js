'use strict';

/**
 * Requirements
 */
const NodeIterator = require(SOURCE_ROOT + '/transformer/NodeIterator.js').NodeIterator;
const Parser = require(SOURCE_ROOT + '/transformer/Parser.js').Parser;
const ValueNode = require(SOURCE_ROOT + '/transformer/node/ValueNode.js').ValueNode;
const LiteralNode = require(SOURCE_ROOT + '/transformer/node/LiteralNode.js').LiteralNode;
const NodeList = require(SOURCE_ROOT + '/transformer/node/NodeList.js').NodeList;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const glob = require('glob');
const fs = require('fs');
const co = require('co');


/**
 * Spec
 */
describe(NodeIterator.className, function()
{
    /**
     * Base Test
     */
    baseSpec(NodeIterator, 'transformer/NodeIterator');


    /**
     * NodeIterator Test
     */
    function loadFixture(name)
    {
        const promise = co(function *()
        {
            const rootPath = FIXTURES_ROOT + '/Transformer/';
            const input = fs.readFileSync(rootPath + name + '.input.j2', { encoding: 'utf8' }).replace(/\r/g, '');
            const testee = new Parser();
            const node = yield testee.parse(input);
            return node;
        });
        return promise;
    }


    beforeEach(function()
    {
        fixtures = {};
        fixtures.nodes = [new ValueNode('one'), new ValueNode('two'), new LiteralNode('three'), new ValueNode('four')];
    });


    describe('#constructor()', function()
    {
        it('should allow to use a Array', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            expect(testee).to.have.length(4);
        });

        it('should allow to use a NodeList', function()
        {
            const testee = new NodeIterator(new NodeList(fixtures.nodes));
            expect(testee).to.have.length(4);
        });
    });


    describe('#seek()', function()
    {
        it('should allow to set the current iteration index', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(0);
            expect(testee.index).to.be.equal(0);
            testee.seek(1);
            expect(testee.index).to.be.equal(1);
        });

        it('should return a boolean indicating if the index is valid', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            expect(testee.seek(0)).to.be.ok;
            expect(testee.seek(3)).to.be.ok;
            expect(testee.seek(4)).to.be.not.ok;
        });
    });


    describe('#currentNode', function()
    {
        it('should return the node at index', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(0);
            expect(testee.currentNode).to.be.equal(fixtures.nodes[0]);
            testee.seek(3);
            expect(testee.currentNode).to.be.equal(fixtures.nodes[3]);
        });

        it('should return undefined when index is invalid', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            expect(testee.currentNode).to.be.undefined;
        });
    });


    describe('#previousNode', function()
    {
        it('should return the node at index - 1', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(1);
            expect(testee.previousNode).to.be.equal(fixtures.nodes[0]);
            testee.seek(3);
            expect(testee.previousNode).to.be.equal(fixtures.nodes[2]);
        });

        it('should return undefined when index - 1 is invalid', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            expect(testee.previousNode).to.be.undefined;
        });
    });


    describe('#nextNode', function()
    {
        it('should return the node at index + 1', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(0);
            expect(testee.nextNode).to.be.equal(fixtures.nodes[1]);
            testee.seek(2);
            expect(testee.nextNode).to.be.equal(fixtures.nodes[3]);
        });

        it('should return undefined when index + 1 is invalid', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(3);
            expect(testee.nextNode).to.be.undefined;
        });
    });


    describe('#peek()', function()
    {
        it('should allow to get a node relative to the current', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(1);
            expect(testee.peek(1)).to.be.equal(fixtures.nodes[2]);
        });

        it('should return undefined if index + offset is invalid', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(1);
            expect(testee.peek(5)).to.be.undefined;
        });
    });


    describe('#next()', function()
    {
        it('should allow to iterate over all nodes', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            const nodes = [];
            while(testee.next())
            {
                nodes.push(testee.currentNode);
            }
            expect(nodes).to.be.deep.equal(fixtures.nodes);
        });


        it('should allow to iterate over all nodes with custom increments', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            const nodes = [];
            while(testee.next(2))
            {
                nodes.push(testee.currentNode);
            }
            expect(nodes).to.be.deep.equal([fixtures.nodes[1], fixtures.nodes[3]]);
        });
    });


    describe('#find()', function()
    {
        it('should allow to find a node by type starting from the current', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(1);
            expect(testee.find('ValueNode')).to.be.deep.equal(fixtures.nodes[1]);
            expect(testee.find('LiteralNode')).to.be.deep.equal(fixtures.nodes[2]);
        });

        it('should allow to find a node by property starting from the current', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(1);
            expect(testee.find(undefined, { value: 'one' })).to.be.undefined;
            expect(testee.find(undefined, { value: 'three' })).to.be.deep.equal(fixtures.nodes[2]);
        });


        it('should allow to limit the search depth', function()
        {
            const testee = new NodeIterator(fixtures.nodes);
            testee.seek(0);
            expect(testee.find(undefined, { value: 'three' }, 1)).to.be.undefined;
            expect(testee.find(undefined, { value: 'three' }, 3)).to.be.deep.equal(fixtures.nodes[2]);
        });
    });
});
