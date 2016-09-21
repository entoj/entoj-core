'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const EntityCategory = require('./EntityCategory.js').EntityCategory;
const EntityIdTemplate = require('./EntityIdTemplate.js').EntityIdTemplate;
const Site = require('./../site/Site.js').Site;
const assertParameter = require('../../utils/assert.js').assertParameter;

/**
 *
 */
class EntityId extends Base
{
    /**
     * @inheritDoc
     */
    static get ID()
    {
        return 'id';
    }

    /**
     * @inheritDoc
     */
    static get PATH()
    {
        return 'path';
    }


    /**
     *
     */
    constructor(category, name, number, site, entityIdTemplate)
    {
        super();

        //Check params
        assertParameter(this, 'category', category, true, EntityCategory);
        assertParameter(this, 'site', site, false, Site);
        assertParameter(this, 'entityIdTemplate', entityIdTemplate, true, EntityIdTemplate);

        // Add initial values
        this._category = category;
        this._name = name || '';
        this._number = number || 0;
        this._site = site;
        this._entityIdTemplate = entityIdTemplate || false;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.entity/EntityId';
    }


    /**
     * @property {entity.EntityCategory}
     */
    get category()
    {
        return this._category;
    }

    set category(value)
    {
        this._category = value;
    }


    /**
     * @property {Bool}
     */
    get isGlobal()
    {
        return this._category ? this._category.isGlobal : false;
    }


    /**
     * @property {number}
     */
    get number()
    {
        return this._number;
    }

    set number(value)
    {
        this._number = value || 0;
    }


    /**
     * @property {string}
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
     * @property {site.Site}
     */
    get site()
    {
        return this._site;
    }

    set site(value)
    {
        this._site = value;
    }


    /**
     * @returns {String}
     */
    get idString()
    {
        return this._entityIdTemplate.id(this);
    }


    /**
     * @returns {String}
     */
    get pathString()
    {
        return this._entityIdTemplate.path(this);
    }


    /**
     * @param {EntityId} other
     * @param {Bool} lazy
     * @returns {Bool}
     */
    clone()
    {
        const result = new EntityId(this._category, this._name, this._number, this._site, this._entityIdTemplate);
        return result;
    }


    /**
     * @param {String} type (PATH, ID)
     * @returns {Bool}
     */
    asString(type)
    {
        let result = '';
        const typeName = type || EntityId.ID;
        switch(typeName.toLowerCase())
        {
            case EntityId.PATH:
                result = this._entityIdTemplate.path(this);
                break;

            case EntityId.ID:
                result = this._entityIdTemplate.id(this);
                break;
        }
        return result;
    }


    /**
     * @param {EntityId} other
     * @param {Bool} lazy
     * @returns {Bool}
     */
    isEqualTo(other, lazy)
    {
        if (other instanceof EntityId)
        {
            let isEqual = this.number === other.number && this.name === other.name;
            if (!lazy && isEqual && other.site && !this.site.isEqualTo(other.site))
            {
                isEqual = false;
            }
            if (isEqual && other.category && !this.category.isEqualTo(other.category))
            {
                isEqual = false;
            }
            return isEqual;
        }

        return false;
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className} ${this.category.longName} ${this.name}]`;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EntityId = EntityId;
