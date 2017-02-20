'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;
const uppercaseFirst = require('../../utils/string.js').uppercaseFirst;
const lorem = require('lorem-ipsum');


/**
 * @memberOf nunjucks.filter
 */
class LipsumFilter extends BaseFilter
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super();
        this._name = 'lipsum';

        // Assign options
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['nunjucks.filter/LipsumFilter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/LipsumFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        const scope = this;
        return function (value, unit, minCount, maxCount)
        {
            // Prepare
            const options =
            {
                units: 'words',
                count: 1
            };

            // Unit
            if (unit == 's')
            {
                options.units = 'sentences';
            }
            if (unit == 'p')
            {
                options.units = 'paragraphs';
            }

            // Count
            const min = minCount || 1;
            const max = maxCount || 10;
            options.count = min + ((max - min) * Math.random());

            // Generate
            return uppercaseFirst(lorem(options));
        };
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.LipsumFilter = LipsumFilter;
