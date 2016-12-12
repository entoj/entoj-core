'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;
const GlobalConfiguration = require('../../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * @memberOf nunjucks.filter
 */
class MediaQueryFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor(globalConfiguration)
    {
        super();
        this._name = 'mediaQuery';

        // Check params
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);

        // Assign options
        this._globalConfiguration = globalConfiguration;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [GlobalConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/MediaQueryFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        const scope = this;
        return function (value)
        {
            const mediaQueries = scope._globalConfiguration.get('mediaQueries');
            scope.logger.info('breakpoint=' + value + ', mediaQuery=' + (mediaQueries[value] || ''));
            return mediaQueries[value] || '';
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.MediaQueryFilter = MediaQueryFilter;
