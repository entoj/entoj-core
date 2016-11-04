'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;


/**
 * Base class for nunjucks filters.
 *
 * @memberOf nunjucks.filter
 */
class BaseFilter extends Base
{
    /**
     */
    constructor()
    {
        super();
        this._name = 'filter';
        this._environment = false;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/BaseFilter';
    }


    /**
     * Name of the filter within templates
     *
     * @property {String}
     */
    get name()
    {
        return this._name;
    }


    /**
     * Registers the filter with a nunjucks environent.
     *
     * @param {nunjucks.Environment} environment
     * @returns {Boolean}
     */
    register(environment)
    {
        if (environment && environment.addFilter)
        {
            environment.addFilter(this.name, this.filter());
            this._environment = environment;
            return true;
        }
        return false;
    }


    /**
     * The actual filter function
     *
     * @returns {Function}
     */
    filter()
    {
        return function()
        {
            return '';
        }
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.BaseFilter = BaseFilter;
