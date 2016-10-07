'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class ParameterNode extends BaseNode
{
    /**
     * @ignore
     */
    constructor(fields, value)
    {
        super();
        this.serializeFields.push('fields', 'value');
        this.nodeFields.push('value');
        this.fields = fields || [];
        this.value = value;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/ParameterNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ParameterNode = ParameterNode;
