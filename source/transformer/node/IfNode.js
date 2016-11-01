'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;
const BaseArray = require('../../base/BaseArray.js').BaseArray;


/**
 *
 */
class IfNode extends NodeList
{
    /**
     * @ignore
     */
    constructor(condition, children, elseChildren)
    {
        super(children);
        this.serializeFields.push('condition', 'elseChildren');
        this.nodeFields.push('condition', 'elseChildren');
        this.condition = condition;
        this.elseChildren = new BaseArray();
        if (elseChildren)
        {
            this.elseChildren.load(elseChildren);
        }
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
