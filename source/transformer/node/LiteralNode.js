'use strict';

/**
 * Requirements
 * @ignore
 */
const ValueNode = require('./ValueNode.js').ValueNode;


/**
 *
 */
class LiteralNode extends ValueNode
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/LiteralNode';
    }


    /**
     * @inheritDoc
     */
    get valueType()
    {
        return typeof this.value;
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
        if (properties && typeof properties.valueType !== 'undefined')
        {
            const value = Array.isArray(properties.valueType) ? properties.valueType : [properties.valueType];
            if (value.indexOf(this.valueType) === -1)
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
module.exports.LiteralNode = LiteralNode;
