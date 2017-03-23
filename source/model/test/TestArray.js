'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseArray = require('../../base/BaseArray.js').BaseArray;


/**
 * @class
 * @memberOf model.test
 * @extends {Base}
 */
class TestArray extends BaseArray
{
    /**
     * The namespaced class name
     *
     * @type {string}
     * @static
     */
    static get className()
    {
        return 'model.test/TestArray';
    }


    /**
     * @param {Class} type
     * @returns {Array}
     */
    getByType(type)
    {
        const result = this.filter(function(item)
        {
            return item instanceof type;
        });
        return result;
    }


    /**
     * @param {Class} type
     * @returns {Array}
     */
    getFirstByType(type)
    {
        return this.getByType(type).shift();
    }


    /**
     * @param {String} name
     * @returns {Array}
     */
    getByName(name)
    {
        const result = this.filter(function(item)
        {
            return item.name == name;
        });
        return result;
    }


    /**
     * @param {String} type
     * @returns {Test}
     */
    getFirstByName(name)
    {
        return this.getByName(name).shift();
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.TestArray = TestArray;
