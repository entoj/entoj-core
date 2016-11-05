'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;


/**
 * @memberOf nunjucks.filter
 */
class LinkFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'link';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/LinkFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        return function(value)
        {
            if (value && value.selfLink)
            {
                return value.selfLink;
            }
            if (value && value.dataUrlBlob)
            {
                return value.dataUrlBlob;
            }
            return 'JavaScript:;';
        }
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.LinkFilter = LinkFilter;
