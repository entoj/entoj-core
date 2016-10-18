'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 * A node with a simple scalar value attribute.
 * This is a virtual node and should not be used directly.
 */
class ValueNode extends BaseNode
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
        return 'transformer.node/ValueNode';
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
        if (properties && typeof properties.value !== 'undefined')
        {
            const value = Array.isArray(properties.value) ? properties.value : [properties.value];
            if (value.indexOf(this.value) === -1)
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
module.exports.ValueNode = ValueNode;
