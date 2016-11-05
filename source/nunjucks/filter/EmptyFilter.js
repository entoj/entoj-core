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
class EmptyFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'empty';
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
    filter()
    {
        return function(value)
        {
            return isEmpty(value);
        }
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EmptyFilter = EmptyFilter;
