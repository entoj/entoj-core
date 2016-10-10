'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class NodeList extends BaseNode
{
    /**
     * @ignore
     */
    constructor(children)
    {
        super();
        this.serializeFields.push('children');
        this.nodeFields.push('children');
        this.children = children || [];
        this.index = -1;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/NodeList';
    }


    /**
     * @type BaseNode
     */
    get currentChild()
    {
        return this.peek(0);
    }


    /**
     * @type BaseNode
     */
    get previousChild()
    {
        return this.peek(-1);
    }


    /**
     * @type BaseNode
     */
    get nextChild()
    {
        return this.peek(+1);
    }


    /**
     * @returns BaseNode
     */
    peekChild(offset)
    {
        const index = this.index + offset;
        if (index < 0 || index >= this.children.length)
        {
            return undefined;
        }
        return this.children[index];
    }


    /**
     * @returns BaseNode
     */
    nextChild(offset)
    {
        this.index+= offset || 1;
        return this.peek(0);
    }


    /**
     * @returns {void}
     */
    gotoChild(index)
    {
        this.index = index;
    }

}


/**
 * Exports
 * @ignore
 */
module.exports.NodeList = NodeList;
