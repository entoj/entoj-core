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
}


/**
 * Exports
 * @ignore
 */
module.exports.NodeList = NodeList;
