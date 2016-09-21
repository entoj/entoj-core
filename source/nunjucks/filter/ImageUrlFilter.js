'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class ImageUrlFilter extends Filter
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
        return 'nunjucks.filter/ImageUrlFilter';
    }


    /**
     * @inheritDoc
     */
    get name()
    {
        return 'imageUrl';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        const scope = this;
        return function (value, image, width, height, force)
        {
            if (scope._mode == 'internal')
            {
                return '/images/' + (image || '*.png') + '/' + (width || 0) + '/' + (height || 0) + '/' + (force || 0);
            }
            if (scope._mode == 'umbraco')
            {
                let parameters = '';
                if (width)
                {
                    parameters+= 'width: ' + (width || 0);
                }
                if (height)
                {
                    parameters+= (parameters.length) ? ', ' : '';
                    parameters+= 'height: ' + (height || 0);
                }
                return '@image.GetCropUrl(' + parameters + ')';
            }
            return '';
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageUrlFilter = ImageUrlFilter;
