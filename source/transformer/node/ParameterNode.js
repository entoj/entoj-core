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
    constructor(name, value)
    {
        super();
        this.serializeFields.push('name', 'value');
        this.nodeFields.push('value');
        this.name = name || '';
        this.value = value || undefined;
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
