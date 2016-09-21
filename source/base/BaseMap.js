'use strict';

/**
 * Requirements
 * @ignore
 */
const winston = require('winston');
const isPlainObject = require('lodash.isplainobject');
const iterable = require('../utils/iterable.js').iterable;
const merge = require('lodash.merge');


/**
 * @class
 * @memberOf base
 * @extends {Array}
 */
class BaseMap extends Map
{
    /**
     * @inheritDocs
     */
    constructor(data)
    {
        super(iterable(data));
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
        return 'base/BaseMap';
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
     * @type {Winston.logger}
     */
    get logger()
    {
        return winston.loggers.get('debug');
    }


    /**
     * @param {String} path
     * @param {*} defaultValue
     */
    getByPath(path, defaultValue)
    {
        const names = path.split('.');
        let current = this;
        for (const name of names)
        {
            // Try to get value at current name
            if (current instanceof Map)
            {
                current = current.get(name);
            }
            else if (typeof current[name] !== 'undefined')
            {
                current = current[name];
            }
            else
            {
                current = undefined;
            }

            // Are we done?
            if (typeof current === 'undefined')
            {
                return defaultValue;
            }
        }

        // Return found value
        if (typeof current !== 'undefined')
        {
            return current;
        }

        // Return default when nothing was found
        return defaultValue;
    }


    /**
     * @param {*} data
     * @param {bool} clear
     */
    load(data, clear)
    {
        if (clear === true)
        {
            this.clear();
        }

        if (!data)
        {
            return;
        }

        if (data instanceof Map || data instanceof BaseMap || typeof data.keys == 'function')
        {
            for (const item of data.keys())
            {
                this.set(item, data.get(item));
            }
        }
        else if (isPlainObject(data))
        {
            for (const key in data)
            {
                this.set(key, data[key]);
            }
        }
    }


    /**
     * @param {*} data
     */
    merge(data)
    {
        if (!data)
        {
            return;
        }

        if (data instanceof Map || data instanceof BaseMap || typeof data.keys == 'function')
        {
            for (const key of data.keys())
            {
                /*console.log('Merging', key);
                console.log('Merging base', this.getByPath(key, {}));
                console.log('Merging data', data.get(key));
                */
                const merged = merge(this.getByPath(key, {}), data.get(key));
                //console.log('Merging merged', merged);
                this.set(key, merged);
            }
        }
        else if (isPlainObject(data))
        {
            for (const key in data)
            {
                const merged = merge(this.getByPath(key, {}), data[key]);
                //console.log('Merging merged', merged);
                this.set(key, merged);
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
        return `[${this.className} size=${this.size}]`;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.BaseMap = BaseMap;
