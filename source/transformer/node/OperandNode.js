'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class OperandNode extends BaseNode
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
        return 'transformer.node/OperandNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.OperandNode = OperandNode;
