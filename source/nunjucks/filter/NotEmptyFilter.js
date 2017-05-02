'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;
const isEmpty = require('../../utils/objects.js').isEmpty;


/**
 * @memberOf nunjucks.filter
 */
class NotEmptyFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'notempty';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/NotEmptyFilter';
    }


    /**
     * @param {*} value
     */
    filter(value)
    {
        return function(value)
        {
            if (value === false)
            {
                return true;
            }
            return !isEmpty(value);
        }
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.NotEmptyFilter = NotEmptyFilter;
