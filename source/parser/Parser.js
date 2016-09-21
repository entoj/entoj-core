'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Base class for Parsers.
 */
class Parser extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser/Parser';
    }


    /**
     * @param {*} content
     * @param {string} options
     * @returns {Promise<Object>}
     */
    parse(content, options)
    {
        return Promise.resolve(false);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Parser = Parser;
