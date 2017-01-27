'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;

/**
 * @memberOf nunjucks.filter
 */
class DateFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'date';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/DateFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        return function(value)
        {
            return value;
        }
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DateFilter = DateFilter;
