'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Base class for Formatters.
 */
class BaseFormatter extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'formatter/BaseFormatter';
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
module.exports.BaseFormatter = BaseFormatter;
