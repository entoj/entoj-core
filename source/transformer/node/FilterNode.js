'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class FilterNode extends BaseNode
{
    /**
     * @ignore
     */
    constructor(name, parameters, value)
    {
        super();
        this.serializeFields.push('name', 'parameters', 'value');
        this.nodeFields.push('parameters', 'value');
        this.name = name || '';
        this.parameters = parameters;
        this.value = value;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/FilterNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.FilterNode = FilterNode;
