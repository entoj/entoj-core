'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * @class
 * @memberOf entity
 * @extends {Base}
 */
class BaseLoader extends Base
{
    /**
     * @ignore
     */
    constructor(items)
    {
        super();
        this._items = items || [];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['model/BaseLoader.items'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model/BaseLoader';
    }


    /**
     * Loads & parses data and resolve it as an array
     *
     * @param {*} changes
     * @returns {Promise.<Array>}
     */
    load(changes)
    {
        return Promise.resolve(this._items);
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.BaseLoader = BaseLoader;
