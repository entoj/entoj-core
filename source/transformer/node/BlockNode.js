'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;


/**
 *
 */
class BlockNode extends NodeList
{
    /**
     * @ignore
     */
    constructor(name, children)
    {
        super(children);
        this.serializeFields.push('name');
        this.name = name;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/BlockNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BlockNode = BlockNode;
