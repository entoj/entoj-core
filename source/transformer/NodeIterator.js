'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const NodeList = require('./node/NodeList.js').NodeList;


/**
 *
 */
class NodeIterator extends Base
{
    /**
     * @ignore
     */
    constructor(nodes)
    {
        super();

        this.nodes = [];
        if (Array.isArray(nodes))
        {
            this.nodes = nodes;
        }
        if (nodes instanceof NodeList)
        {
            this.nodes = nodes.children;
        }
        this._index = -1;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/NodeIterator';
    }


    /**
     * @returns {Number}
     */
    get length()
    {
        return (this.nodes) ? this.nodes.length : 0;
    }


    /**
     * @returns {Number}
     */
    get index()
    {
        return this._index;
    }


    /**
     * @returns {BaseNode|undefined}
     */
    get currentNode()
    {
        return this.peek(0);
    }


    /**
     * @returns {BaseNode|undefined}
     */
    get previousNode()
    {
        return this.peek(-1);
    }


    /**
     * @returns {BaseNode|undefined}
     */
    get nextNode()
    {
        return this.peek(+1);
    }


    /**
     * @returns {BaseNode|undefined}
     */
    find(type, properties, range)
    {
        const count = Math.min(this.length, this.index + (range || 1000));
        for (let offset = 0; offset < count; offset++)
        {
            const node = this.peek(offset);
            if (node && node.is(type, properties))
            {
                return node;
            }
        }
        return undefined;
    }


    /**
     * @returns {void}
     */
    reset()
    {
        this._index = -1;
    }


    /**
     * @returns {Boolean}
     */
    seek(index)
    {
        this._index = index;
        return this.index < this.length && this.index >= 0;
    }


    /**
     * @returns {BaseNode|undefined}
     */
    peek(offset)
    {
        return this.nodes[this.index + (offset || 0)];
    }


    /**
     * @returns {Boolean}
     */
    next(offset)
    {
        return this.seek(this._index + (offset || 1));
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.NodeIterator = NodeIterator;
