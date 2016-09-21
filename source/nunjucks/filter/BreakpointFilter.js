'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class BreakpointFilter extends Filter
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
        return 'nunjucks.filter/BreakpointFilter';
    }


    /**
     * @inheritDoc
     */
    get name()
    {
        return 'breakpoint';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        const scope = this;
        return function (value)
        {
            return scope._breakpoints[value] || {};
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BreakpointFilter = BreakpointFilter;
