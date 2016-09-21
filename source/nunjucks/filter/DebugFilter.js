'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;

/**
 * @memberOf nunjucks.filter
 */
class DebugFilter extends Filter
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/DebugFilter';
    }


    /**
     * @inheritDoc
     */
    get name()
    {
        return 'debug';
    }


    /**
     * @param {*} value
     */
    execute(value)
    {
        return function (value)
        {
            return '<pre>\n' + JSON.stringify(value, null, 4) + '\n</pre>';
        };
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.DebugFilter = DebugFilter;
