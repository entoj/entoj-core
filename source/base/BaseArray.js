'use strict';

/**
 * Requirements
 * @ignore
 */
const winston = require('winston');
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
     * @type {Winston.logger}
     */
    get logger()
    {
        return winston.loggers.get('debug');
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
