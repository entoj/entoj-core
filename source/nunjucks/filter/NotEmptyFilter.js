'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class NotEmptyFilter extends Filter
{
    /**
     * @param {nunjucks.Environment} environment
     * @param {String} mode
     */
    constructor(environment, mode)
    {
        super(environment);
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/NotEmptyFilter';
    }


    /**
     * @inheritDoc
     */
    get name()
    {
        return 'notempty';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        const scope = this;
        return function (value)
        {
            return value;
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.NotEmptyFilter = NotEmptyFilter;
