'use strict';

/**
 * Requirements
 * @ignore
 */
const intel = require('intel');

/**
 * Instance Id counter
 * @type {Number}
 */
let instanceId = 1;


/**
 * Setup intel
 */
intel.config(
    {
        formatters:
        {
            'console':
            {
                'datefmt': '%H:%M:%S:%L',
                'format': '[%(date)s] %(levelname)s %(name)s - %(message)s',
                'colorize': true
            }
        },
        handlers:
        {
            'console':
            {
                'class': intel.handlers.Console,
                'formatter': 'console'
            }
        },
        loggers:
        {
            'entoj':
            {
                'handlers': ['console'],
                'level': intel.ERROR
            }
        }
    });


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
        this._instanceId = instanceId++;
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
     * @type {intel.logger}
     */
    get logger()
    {
        return intel.getLogger('entoj.' + this.className);
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
