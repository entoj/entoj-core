'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseArray = require('../../base/BaseArray.js').BaseArray;
const documentationTypes = require('./index.js');


/**
 * get by t
 *
 *
 *
 * @class
 * @memberOf model.docmentation
 * @extends {Base}
 */
class DocumentationArray extends BaseArray
{
    /**
     * The namespaced class name
     *
     * @type {string}
     * @static
     */
    static get className()
    {
        return 'model.documentation/DocumentationArray';
    }


    /**
     * @param {Class} type
     * @returns {Array}
     */
    getByType(type)
    {
        const classType = typeof type === 'string' ? documentationTypes[type] : type;
        const result = this.filter(function(item)
        {
            return item instanceof classType;
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
     * @param {string} kind
     * @returns {Array}
     */
    getByContentKind(kind)
    {
        const contentKind = kind.toLowerCase();
        const result = this.filter(function(item)
        {
            return item.contentKind.toLowerCase() === contentKind;
        });
        return result;
    }


    /**
     * @param {Class} kind
     * @returns {Array}
     */
    getFirstByContentKind(kind)
    {
        return this.getByContentKind(kind).shift();
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.DocumentationArray = DocumentationArray;
