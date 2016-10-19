'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Template Parser
 */
class BaseParser extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/BaseParser';
    }


    /**
     * @return {Promise}
     */
    parse(source)
    {
        return Promise.resolve(false);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseParser = BaseParser;
