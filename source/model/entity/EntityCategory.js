'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseValueObject = require('../BaseValueObject.js').BaseValueObject;
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * Describes entity categories in the system.
 * The main property of a category is its long name.
 *
 * A Common example would be catefgories like elements, modules, module groups
 *
 * @memberOf model.entity
 */
class EntityCategory extends BaseValueObject
{
    /**
     * @constant {string}
     * @static
     */
    static get LONG_NAME()
    {
        return 'longName';
    }

    /**
     * @constant {string}
     * @static
     */
    static get SHORT_NAME()
    {
        return 'shortName';
    }

    /**
     * @constant {string}
     * @static
     */
    static get PLURAL_NAME()
    {
        return 'pluralName';
    }

    /**
     * @constant {array}
     * @static
     */
    static get ANY()
    {
        return ['longName', 'shortName', 'pluralName'];
    }

    /**
     * Initializes a category
     *
     * @param {string} longName
     * @param {string} [pluralName]
     * @param {string} [shortName]
     * @param {bool} [isGlobal]
     */
    constructor(longName, pluralName, shortName, isGlobal)
    {
        super();

        //Check params
        assertParameter(this, 'longName', longName, true);

        // Add initial values
        this.longName = longName;
        if (pluralName)
        {
            this.pluralName = pluralName;
        }
        else
        {
            this.pluralName = this.longName + 's';
        }
        if (shortName)
        {
            this.shortName = shortName;
        }
        else
        {
            this.shortName = this.longName.substr(0, 1).toLowerCase();
        }
        if (isGlobal)
        {
            this.isGlobal = isGlobal;
        }
        else
        {
            this.isGlobal = false;
        }
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.entity/EntityCategory';
    }


    /**
     * @inheritDocs
     */
    get uniqueId()
    {
        return this._longName + this._isGlobal;
    }


    /**
     * @property {String}
     */
    get longName()
    {
        return this._longName;
    }

    set longName(value)
    {
        this._longName = value;
    }


    /**
     * @property {String}
     */
    get shortName()
    {
        return this._shortName;
    }

    set shortName(value)
    {
        this._shortName = value;
    }


    /**
     * @property {String}
     */
    get pluralName()
    {
        return this._pluralName;
    }

    set pluralName(value)
    {
        this._pluralName = value;
    }


    /**
     * @property {Bool}
     */
    get isGlobal()
    {
        return this._isGlobal;
    }

    set isGlobal(value)
    {
        this._isGlobal = value;
    }


    /**
     * @inheritDocs
     */
    toString()
    {
        return `[${this.className} ${this.longName}]`;
    }


    /**
     * @inheritDocs
     */
    update(data, clear)
    {
        const scope = this;
        const promise = super.update(data, clear).then(function()
        {
            scope.longName = data.longName || '';
            scope.shortName = data.shortName || '';
            scope.pluralName = data.pluralName || '';
            scope.isGlobal = data.isGlobal || false;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EntityCategory = EntityCategory;
