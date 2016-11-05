'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;


/**
 * @memberOf nunjucks.filter
 */
class TranslateFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor(options)
    {
        super();
        this._name = 'translate';

        // Assign options
        this._options = options || {};
        this._options.translations = this._options.translations || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['nunjucks.filter/TranslateFilter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/TranslateFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        const scope = this;
        return function (value)
        {
            if (!value || typeof value !== 'string')
            {
                return '';
            }
            if (!scope._options.translations[value])
            {
                scope.logger.error('Missing translation for ' + value);
                return value;
            }
            return scope._options.translations[value];
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TranslateFilter = TranslateFilter;
