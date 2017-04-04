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
        return function (value, ...variables)
        {
            console.log('translate', value, variables);

            // Use value or key for translations
            let translationKey = value;
            if (!translationKey && variables)
            {
                translationKey = variables.shift();
            }
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
            let result = scope._options.translations[translationKey];
            if (variables && variables.length)
            {
                for (let index = 0; index < variables.length; index++)
                {
                    console.log(index, variables[index]);
                    result = result.replace('{' + index + '}', variables[index]);
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
module.exports.TranslateFilter = TranslateFilter;
