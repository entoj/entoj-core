'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;


/**
 * @memberOf nunjucks.filter
 */
class MarkupFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'markup';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/MarkupFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        return function (value, style)
        {
            if (value && value.indexOf('<') > -1)
            {
                return value;
            }
            return '<p>' + (value || '') + '</p>';
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.MarkupFilter = MarkupFilter;
