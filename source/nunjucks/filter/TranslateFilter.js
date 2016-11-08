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
        return function (value, key)
        {
            // Use value or key for translations
            const translationKey = key || value;
            if (!translationKey || typeof translationKey !== 'string')
            {
                return '';
            }

            // Translate
            if (!scope._options.translations[translationKey])
            {
                scope.logger.error('Missing translation for ' + translationKey);
                return translationKey;
            }
            return scope._options.translations[translationKey];
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TranslateFilter = TranslateFilter;
