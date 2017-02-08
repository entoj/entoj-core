'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;

/**
 * @memberOf nunjucks.filter
 */
class PrettyJsonFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'prettyjson';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/PrettyJsonFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        return function(value)
        {
            return JSON.stringify(value, null, 4);
        }
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.PrettyJsonFilter = PrettyJsonFilter;
