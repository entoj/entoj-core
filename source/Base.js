'use strict';

/**
 * Requirements
 * @ignore
 */
const winston = require('winston');


/**
 * Base class providing some common helpers.
 *
 * @class
 */
class Base
{
    /**
     * @ignore
     */
    constructor()
    {
        this._instanceId = (Date.now() * 1000) + (Math.random() * 100);
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
        return 'Base';
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
     * Returns a simple string representation of the object
     *
     * @returns {string}
     */
    toString()
    {
        return `[${this.className}]`;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Base = Base;
