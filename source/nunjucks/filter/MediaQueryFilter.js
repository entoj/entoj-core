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
        this._options.breakpoints = this._options.breakpoints || {};
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
        return function (value, headlineOffset)
        {
            const device = value.split('And').shift().trim();
            const breakpoint = scope._options.breakpoints[device] || {};
            let result = '';
            if (value.endsWith('AndBelow'))
            {
                if (breakpoint.maxWidth)
                {
                    result+= '(max-width: ' + breakpoint.maxWidth + ')';
                }
            }
            else if (value.endsWith('AndAbove'))
            {
                if (breakpoint.minWidth)
                {
                    result+= '(min-width: ' + breakpoint.minWidth + ')';
                }
            }
            else
            {
                if (breakpoint.minWidth)
                {
                    result+= '(min-width: ' + breakpoint.minWidth + ')';
                }
                if (breakpoint.maxWidth)
                {
                    result+= (result.length ? ' and ' : '') + '(max-width: ' + breakpoint.maxWidth + ')';
                }
            }

            return result;
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.MediaQueryFilter = MediaQueryFilter;
