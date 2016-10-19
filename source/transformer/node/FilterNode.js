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
        this.parameters = parameters || false;
        this.value = value;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/FilterNode';
    }


    /**
     * @inheritDoc
     */
    is(type, properties)
    {
        if (!super.is(type, properties))
        {
            return false;
        }

        // Check value
        if (properties && typeof properties.name !== 'undefined')
        {
            const names = Array.isArray(properties.name) ? properties.name : [properties.name];
            if (names.indexOf(this.name) === -1)
            {
                return false;
            }
        }

        return true;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.FilterNode = FilterNode;
