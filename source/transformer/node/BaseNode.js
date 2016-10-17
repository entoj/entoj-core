'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;


/**
 * Token
 */
class BaseNode extends Base
{
    /**
     * @ignore
     */
    constructor()
    {
        super();
        this.type = this.className.split('/').pop();
        this.serializeFields = [];
        this.nodeFields = [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/BaseNode';
    }


    /**
     * @param {String} type - Node type
     * @param {Object} properties - Node properties
     * @return {Bool}
     */
    isNode(type, properties)
    {
        // Check type
        const types = Array.isArray(type) ? type : [type];
        if (types.indexOf(this.type) === -1)
        {
            return false;
        }

        return true;
    }


    /**
     *
     */
    serialize()
    {
        const result = { type: this.className };

        // Serialize fields
        for (const field of this.serializeFields)
        {
            if (Array.isArray(this[field]))
            {
                result[field] = [];
                for (const item of this[field])
                {
                    if (item instanceof BaseNode)
                    {
                        result[field].push(item.serialize());
                    }
                    else
                    {
                        result[field].push(item);
                    }
                }
            }
            else if (this[field] instanceof BaseNode)
            {
                result[field] = this[field].serialize();
            }
            else if (typeof this[field] !== 'undefined')
            {
                result[field] = this[field];
            }
        }

        return result;
    }


    /**
     *
     */
    clone()
    {
        const result = new this.constructor();
        for (const field of this.serializeFields)
        {
            result[field] = this[field];
            if (Array.isArray(this[field]))
            {
                result[field] = [];
                for (const item of this[field])
                {
                    if (item instanceof BaseNode)
                    {
                        result[field].push(item.clone());
                    }
                    else
                    {
                        result[field].push(item);
                    }
                }
            }
            else if (this[field] instanceof BaseNode)
            {
                result[field] = this[field].clone();
            }
            else
            {
                result[field] = this[field];
            }
        }
        return result;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseNode = BaseNode;
