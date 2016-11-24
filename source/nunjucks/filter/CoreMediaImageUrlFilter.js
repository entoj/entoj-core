'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;


/**
 * @memberOf nunjucks.filter
 */
class CoreMediaImageUrlFilter extends BaseFilter
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
        return { 'parameters': ['nunjucks.filter/CoreMediaImageUrlFilter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/CoreMediaImageUrlFilter';
    }


    /**
     * @inheritDoc
     */
    filter(value, width, height, force)
    {
        const scope = this;
        return function(value, aspect, width, height)
        {
            const id = value && value.dataUrlBlob ? value.dataUrlBlob : '*.png';
            return '/images/' + id + '/' + (width || 0) + '/' + (height || 0) + '/1';
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaImageUrlFilter = CoreMediaImageUrlFilter;
