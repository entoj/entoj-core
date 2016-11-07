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
            if (scope._options.mode === 'umbraco')
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
            let id = value ? value : '*.png';
            if (scope._options.mode === 'coremedia')
            {
                id = value && value.dataUrlBlob ? value.dataUrlBlob : '*.png';
            }
            return '/images/' + id + '/' + (width || 0) + '/' + (height || 0) + '/' + (force || 0);
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageUrlFilter = ImageUrlFilter;
