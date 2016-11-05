'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;


/**
 * @memberOf nunjucks.filter
 */
class DebugFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'debug';
    }

    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/DebugFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        return function(value)
        {
            return '<pre>\n' + JSON.stringify(value, null, 4) + '\n</pre>';
        };
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.DebugFilter = DebugFilter;
