'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;


/**
 * @memberOf nunjucks.filter
 */
class ImageUrlFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor(options)
    {
        super();
        this._name = 'imageUrl';

        // Assign options
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['nunjucks.filter/ImageUrlFilter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/ImageUrlFilter';
    }


    /**
     * @inheritDoc
     */
    filter(value, width, height, force)
    {
        const scope = this;
        return function(value, width, height, force)
        {
            let id = value ? value : '*.png';
            return '/images/' + id + '/' + (width || 0) + '/' + (height || 0) + '/' + (force || 0);
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageUrlFilter = ImageUrlFilter;
