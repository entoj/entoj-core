'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class VariableNode extends BaseNode
{
    /**
     * @ignore
     */
    constructor(fields)
    {
        super();
        this.serializeFields.push('fields');
        this.fields = fields || [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/VariableNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.VariableNode = VariableNode;
