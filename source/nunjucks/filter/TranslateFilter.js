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
        return function (value, name)
        {
            const strings =
            {
                'navigation.menu': 'Menü',
                'navigation.search': 'Suche',
                'navigation.login': 'Login',
                'navigation.meinetk': 'Meine TK'
            };
            return strings[name] || name;
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TranslateFilter = TranslateFilter;
