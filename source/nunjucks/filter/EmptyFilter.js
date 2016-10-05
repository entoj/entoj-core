'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class EmptyFilter extends Filter
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
        return 'nunjucks.filter/EmptyFilter';
    }


    /**
     * @inheritDoc
     */
    get name()
    {
        return 'empty';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        const scope = this;
        return function (value)
        {
            return !value;
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EmptyFilter = EmptyFilter;
