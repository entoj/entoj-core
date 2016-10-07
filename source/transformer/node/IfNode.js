'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;


/**
 *
 */
class IfNode extends NodeList
{
    /**
     * @ignore
     */
    constructor(condition, children)
    {
        super(children);
        this.serializeFields.push('condition');
        this.nodeFields.push('condition');
        this.condition = condition;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/IfNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.IfNode = IfNode;
