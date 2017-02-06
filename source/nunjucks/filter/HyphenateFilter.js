'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;

/**
 * @memberOf nunjucks.filter
 */
class HyphenateFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'hyphenate';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/HyphenateFilter';
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
module.exports.HyphenateFilter = HyphenateFilter;
