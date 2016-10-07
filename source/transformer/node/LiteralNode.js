'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class LiteralNode extends BaseNode
{
    /**
     * @ignore
     */
    constructor(value)
    {
        super();
        this.serializeFields.push('value');
        this.value = value;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/LiteralNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.LiteralNode = LiteralNode;
