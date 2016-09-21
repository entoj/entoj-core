'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseValueObject = require('../BaseValueObject.js').BaseValueObject;
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * Describes a Site
 *
 * @memberOf model.site
 */
class Site extends BaseValueObject
{
    /**
     * @constant {string}
     * @static
     */
    static get NAME()
    {
        return 'name';
    }


    /**
     * @constant {array}
     * @static
     */
    static get ANY()
    {
        return ['name'];
    }


    /**
     * Initializes a site
     *
     * @param {string} name
     * @param {string} [description]
     * @param {string} [extnds]
     */
    constructor(name, description)
    {
        super();

        //Check params
        assertParameter(this, 'name', name, true);

        // Add initial values
        this.name = name;
        if (description)
        {
            this.description = description;
        }
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.site/Site';
    }


    /**
     * @inheritDocs
     */
    get uniqueId()
    {
        return this._name;
    }


    /**
     * @let {String}
     */
    get name()
    {
        return this._name;
    }

    set name(value)
    {
        this._name = value;
    }


    /**
     * @let {String}
     */
    get description()
    {
        return this._description;
    }

    set description(value)
    {
        this._description = value;
    }


    /**
     * @let {site}
     */
    get extends()
    {
        return this._extends;
    }

    set extends(value)
    {
        assertParameter(this, 'value', value, true, Site);
        this._extends = value;
    }


    /**
     * @inheritDocs
     */
    toString()
    {
        return `[${this.className} ${this.name}]`;
    }


    /**
     * @inheritDocs
     */
    update(data, clear)
    {
        const scope = this;
        const promise = super.update(data, clear).then(function()
        {
            scope.name = data.name || '';
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Site = Site;
