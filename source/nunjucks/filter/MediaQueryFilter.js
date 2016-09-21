'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class MediaQueryFilter extends Filter
{
    /**
     * @param {nunjucks.Environment} environment
     * @param {Object} breakpoints
     */
    constructor(environment, breakpoints)
    {
        super(environment);

        // Assign options
        this._breakpoints = breakpoints || {};
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
    get name()
    {
        return 'mediaQuery';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        const scope = this;
        return function (value, headlineOffset)
        {
            const device = value.split('And').shift().trim();
            const breakpoint = scope._breakpoints[device] || {};
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
