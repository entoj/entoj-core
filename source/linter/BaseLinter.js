'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Base class for Linters.
 */
class BaseLinter extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'linter/BaseLinter';
    }


    /**
     * @param {*} content
     * @param {string} options
     * @returns {Promise<Object>}
     */
    lint(content, options)
    {
        const result =
        {
            success: true,
            errorCount:0,
            warningCount:0,
            messages:[]
        };
        return Promise.resolve(result);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseLinter = BaseLinter;
