'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;


/**
 * @memberOf nunjucks.filter
 */
class Filter extends Base
{
    /**
     * @param {nunjucks.Environment} environment
     */
    constructor(environment)
    {
        super();
        this._environment = environment;
        this._environment.addFilter(this.name, this.execute());
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/DebugFilter';
    }


    /**
     * The filter name
     *
     * @property {String}
     */
    get name()
    {
        return 'filter';
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className}]`;
    }


    /**
     * @returns {String}
     */
    execute()
    {
        return function()
        {
            return '';
        };
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.Filter = Filter;
