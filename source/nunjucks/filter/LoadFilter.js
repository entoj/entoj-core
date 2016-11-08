'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;
const ViewModelRepository = require('../../model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const assertParameter = require('../../utils/assert.js').assertParameter;
const synchronize = require('../../utils/synchronize.js');
const isString = require('lodash.isstring');


/**
 * @memberOf nunjucks.filter
 */
class LoadFilter extends BaseFilter
{
    /**
     * @param {model.viewmodel.ViewModelRepository} viewModelRepository
     * @param {Object} options
     */
    constructor(viewModelRepository, options)
    {
        super();
        this._name = 'load';

        // Check params
        assertParameter(this, 'viewModelRepository', viewModelRepository, true, ViewModelRepository);

        // Assign options
        this._options = options || {};
        this._viewModelRepository = viewModelRepository;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [ViewModelRepository, 'nunjucks.filter/LoadFilter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/LoadFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        const scope = this;
        return function (value)
        {
            if (!isString(value))
            {
                return value;
            }
            const site = (this && this.globals && this.globals.site) ? this.globals.site : false;
            const viewModel = synchronize.execute(scope._viewModelRepository, 'getByPath', [value, site]);
            return viewModel.data;
        };
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.LoadFilter = LoadFilter;
