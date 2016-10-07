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
            else
            {
                result[field] = this[field];
            }
        }

        return result;
    }


    /**
     *
     */
    clone(deep)
    {
        const result = new this.constructor();
        const keys = Object.keys(this).filter((value) => this.nodeFields.indexOf(value) === -1);
        for (const key of keys)
        {
            result[key] = this[key];
        }
/*
        for (const field of this.serializeFields)
        {
            console.log('Copy ' + field);
            result[field] = this[field];
            if (deep)
            {
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
            else
            {
                result[field] = this[field];
            }
        }
*/
        return result;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseNode = BaseNode;
