'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('./Filter.js').Filter;


/**
 * @memberOf nunjucks.filter
 */
class TranslateFilter extends Filter
{
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
    get name()
    {
        return 'translate';
    }


    /**
     * @param {*} value
     */
    execute()
    {
        const scope = this;
        return function (value, name)
        {
            const strings =
            {
                'navigation.menu': 'Menü',
                'navigation.search': 'Suche',
                'navigation.login': 'Login',
                'navigation.meinetk': 'Meine TK',
                'navigation.back': 'Zurück',
                'navigation.close': 'Schließen',
                'navigation.welcome': 'Willkommen'
            };
            if (!strings[name])
            {
                scope.logger.error('Missing translation for ' + name);
            }
            return strings[name] || name;
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TranslateFilter = TranslateFilter;
