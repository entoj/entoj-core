'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;
const BaseArray = require('../../base/BaseArray.js').BaseArray;


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
        this.children = new BaseArray();
        if (children)
        {
            this.children.load(children);
        }
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/NodeList';
    }


    /**
     * @param {String} type - Node type
     * @param {Object} properties - Node properties
     * @return {Bool}
     */
    find(type, properties)
    {
        if (this.is(type, properties))
        {
            return this;
        }
        for (const node of this.children)
        {
            const found = node.find(type, properties);
            if (found)
            {
                return found;
            }
        }
        return false;
    }


    /**
     * @return {Bool}
     */
    replace(reference, item)
    {
        const replaced = this.children.replace(reference, item);
        for (const node of this.children)
        {
            if (typeof node.replace === 'function')
            {
                node.replace(reference, item);
            }
        }
        return true;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.NodeList = NodeList;
