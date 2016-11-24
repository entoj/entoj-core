'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;


/**
 * @memberOf nunjucks.filter
 */
class MediaQueryFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor(options)
    {
        super();
        this._name = 'mediaQuery';

        // Assign options
        this._options = options || {};
        this._options.mediaQueries = this._options.mediaQueries || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['nunjucks.filter/MediaQueryFilter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/MediaQueryFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        const scope = this;
        return function (value)
        {
            return scope._options.mediaQueries[value] || '';
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.MediaQueryFilter = MediaQueryFilter;
