'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class LinkFilter extends Filter
{
    /**
     * @param {nunjucks.Environment} environment
     * @param {String} mode
     */
    constructor(environment, mode)
    {
        super(environment);

        // Assign options
        this._mode = mode || 'internal';
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
    get name()
    {
        return 'link';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        return function (value)
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
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.LinkFilter = LinkFilter;
