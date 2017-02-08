'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseValueObject = require('../BaseValueObject.js').BaseValueObject;
const Entity = require('./Entity.js').Entity;
const Site = require('../site/Site.js').Site;
const ContentKind = require('../ContentKind.js');
const BaseMap = require('../../base/BaseMap.js').BaseMap;
const EntityIdTemplate = require('./EntityIdTemplate.js').EntityIdTemplate;
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * @namespace model.entity
 */
class EntityAspect extends BaseValueObject
{
    /**
     * @param {model.entity.Entity} entity
     * @param {model.site.Site} site
     */
    constructor(entity, site, entityIdTemplate)
    {
        super();

        //Check params
        assertParameter(this, 'entity', entity, true, Entity);
        assertParameter(this, 'site', site, true, Site);
        assertParameter(this, 'entityIdTemplate', entityIdTemplate, true, EntityIdTemplate);

        // Add initial values
        this._entity = entity;
        this._site = site;
        this._entityIdTemplate = entityIdTemplate;

        // Extend id
        this._entityId = this._entity.id.clone();
        this._entityId.site = this._site;

        // Get extended sites
        this._extendedSites = [];
        let currentSite = this._site;
        while(currentSite)
        {
            this._extendedSites.unshift(currentSite);
            currentSite = currentSite.extends;
        }

        // Extend files & properties & documentation
        const properties = new BaseMap();
        const examples = {};
        const macros = {};
        const texts = [];
        const datamodels = [];
        for (const s of this._extendedSites)
        {
            // Files
            this.files.load(this._entity.files.filter(file => file.site === s));

            // Examples
            const siteExamples = this._entity.documentation.filter(doc => doc.contentKind === ContentKind.EXAMPLE);
            for (const siteExample of siteExamples)
            {
                examples[siteExample.file.basename] = siteExample;
            }

            // Models
            const siteDatamodels = this._entity.documentation.filter(doc => doc.contentKind === ContentKind.DATAMODEL);
            for (const siteDatamodel of siteDatamodels)
            {
                datamodels.push(siteDatamodel);
            }

            // Macros
            const siteMacros = this._entity.documentation.filter(doc => doc.contentKind === ContentKind.MACRO);
            for (const siteMacro of siteMacros)
            {
                macros[siteMacro.name] = siteMacro;
            }

            // Text
            const siteTexts = this._entity.documentation.filter(doc => doc.contentKind === ContentKind.TEXT);
            for (const siteText of siteTexts)
            {
                texts.push(siteText);
            }

            // Properties
            const siteProperties = this._entity.properties.getByPath(s.name.toLowerCase(), {});
            properties.merge(siteProperties);
        }
        this.properties.load(properties);
        this.documentation.load(examples);
        this.documentation.load(datamodels);
        this.documentation.load(macros);
        this.documentation.load(texts);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Entity, Site, EntityIdTemplate] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.entity/EntityAspect';
    }


    /**
     * @property {*}
     */
    get uniqueId()
    {
        return this.pathString;
    }


    /**
     * @property {entity.EntityId}
     */
    get id()
    {
        return this._entityId;
    }


    /**
     * @property {String}
     */
    get idString()
    {
        return this._entityIdTemplate.id(this._entityId);
    }


    /**
     * @property {String}
     */
    get pathString()
    {
        return this._entityIdTemplate.path(this._entityId);
    }


    /**
     * @property {model.entity.Entity}
     */
    get entity()
    {
        return this._entity;
    }


    /**
     * @property {model.site.Site}
     */
    get site()
    {
        return this._site;
    }


    /**
     * @property {Bool}
     */
    get isGlobal()
    {
        return this._entity.isGlobal;
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className} ${this.site.name}/${this.id.category.longName}-${this.id.name}]`;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EntityAspect = EntityAspect;
