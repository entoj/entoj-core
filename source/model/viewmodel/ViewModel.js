'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;


/**
 * @memberOf file
 * @extends {Base}
 */
class ViewModel extends Base
{
    /**
     * @param {string} filename
     */
    constructor(data)
    {
        super();

        // Add initial values
        this._data = data || false;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.viewmodel/ViewModel';
    }


    /**
     * @inheritDoc
     */
    get data()
    {
        return this._data;
    }

    /**
     * @inheritDoc
     */
    set data(value)
    {
        this._data = value;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ViewModel = ViewModel;
