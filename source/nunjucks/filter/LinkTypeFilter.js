'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class LinkTypeFilter extends Filter
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
        return 'nunjucks.filter/LinkTypeFilter';
    }


    /**
     * @inheritDoc
     */
    get name()
    {
        return 'linkType';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        const scope = this;
        return function (value)
        {
            return (value.type && value.type === 'com.coremedia.blueprint.cae.contentbeans.CMExternalLinkImpl$$') ? 'external' : 'internal';
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.LinkTypeFilter = LinkTypeFilter;
