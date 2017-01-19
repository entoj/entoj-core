'use strict';

/**
 * Requirements
 * @ignore
 */
const intel = require('intel');
const isPlainObject = require('lodash.isplainobject');


/**
 * @class
 * @memberOf base
 * @extends {Array}
 */
class BaseArray extends Array
{
    /**
     * @inheritDocs
     */
    constructor()
    {
        super();
        this._instanceId = (Date.now() * 100) + (Math.random() * 10);
    }


    /**
     * Injection meta for DIContainer
     *
     * @type {Object}
     * @static
     */
    static get injections()
    {
        return {};
    }


    /**
     * The namespaced class name
     *
     * @type {string}
     * @static
     */
    static get className()
    {
        return 'base/BaseArray';
    }


    /**
     * The namespaced class name
     *
     * @type {string}
     */
    get className()
    {
        return this.constructor.className;
    }


    /**
     * Global unique instance id
     *
     * @type {Number}
     */
    get instanceId()
    {
        return this._instanceId;
    }


    /**
     * The base debug logger
     *
     * @type {intel.logger}
     */
    get logger()
    {
        return intel.getLogger('entoj.' + this.className);
    }


    /**
     * @param {*} item
     * @returns {Boolean}
     */
    remove(item)
    {
        const index = this.indexOf(item);
        if (index !== -1)
        {
            this.splice(index, 1);
        }
        return (index !== -1);
    }


    /**
     * @param {*} reference
     * @param {*} item
     * @returns {Boolean}
     */
    replace(reference, item)
    {
        const index = this.indexOf(reference);
        if (index !== -1)
        {
            this.insertBefore(reference, item);
            this.remove(reference);
            return true;
        }
        return false;
    }


    /**
     * @param {*} reference
     * @param {*} item
     * @returns {Boolean}
     */
    insertBefore(reference, item)
    {
        const index = this.indexOf(reference);
        if (index !== -1)
        {
            this.splice(index, 0, item);
        }
        return (index !== -1);
    }


    /**
     * @param {*} reference
     * @param {*} item
     * @returns {Boolean}
     */
    insertAfter(reference, item)
    {
        const index = this.indexOf(reference);
        if (index !== -1)
        {
            this.splice(index +1, 0, item);
        }
        return (index !== -1);
    }

    /**
     * @param {*} data
     * @param {bool} clear
     */
    load(data, clear)
    {
        if (clear === true)
        {
            this.length = 0;
        }

        if (data instanceof Array)
        {
            for (const item of data)
            {
                this.push(item);
            }
        }
        else if (isPlainObject(data))
        {
            for (const key in data)
            {
                this.push(data[key]);
            }
        }
    }


    /**
     * Returns a simple string representation of the object
     *
     * @returns {string}
     */
    toString()
    {
        return `[${this.className} length=${this.length}]`;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.BaseArray = BaseArray;
