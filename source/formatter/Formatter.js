'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Base class for Formatters.
 */
class Formatter extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'formatter/Formatter';
    }


    /**
     * @param {*} content
     * @param {string} options
     * @returns {Promise<Object>}
     */
    format(content, options)
    {
        return Promise.resolve(false);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Formatter = Formatter;
