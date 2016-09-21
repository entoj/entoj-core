'use strict';

/**
 * Requirements
 * @ignore
 */
const path = require('path');
const templateString = require('es6-template-strings');
const Base = require('../../Base.js').Base;
const EntityCategory = require('../entity/EntityCategory.js').EntityCategory;
const EntityId = require('../entity/EntityId.js').EntityId;
const Entity = require('../entity/Entity.js').Entity;
const EntityAspect = require('../entity/EntityAspect.js').EntityAspect;
const Site = require('../site/Site.js').Site;
const assertParameter = require('../../utils/assert.js').assertParameter;
const trimLeadingSlash = require('../../utils/pathes.js').trimLeadingSlash;
const shortenMiddle = require('../../utils/string.js').shortenMiddle;
require('../../utils/prototypes.js');


/**
 * Holds all path related configuration.
 *
 * Most pathes are configured via template strings
 *
 * @memberOf model.configuration
 */
class PathesConfiguration extends Base
{
    /**
     * @param {object} options
     */
    constructor(options)
    {
        super();

        const opts = options || {};
        this._root = path.resolve(opts.root || __dirname);
        this._cache = this.renderTemplate(opts.cacheTemplate || '${root}/cache', {}, true);
        this._data = this.renderTemplate(opts.dataTemplate || '${root}/data', {}, true);
        this._bower = opts.bower || undefined;
        this._jspm = opts.jspm || undefined;
        this._entoj = this.renderTemplate(opts.entojTemplate || '${root}/entoj', {}, true);
        this._sites = this.renderTemplate(opts.sitesTemplate || '${root}/sites', {}, true);
        this._siteTemplate = opts.siteTemplate || '${sites}/${site.name.toLowerCase()}';
        this._entityCategoryTemplate = opts.entityCategoryTemplate || '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}';
        this._entityIdTemplate = opts.entityIdTemplate || '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}/${entityCategory.shortName.toLowerCase()}${entityId.number}-${entityId.name.toLowerCase()}';
        this._entityIdGlobalTemplate = opts.entityIdGlobalTemplate || '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['model.configuration/PathesConfiguration.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.configuration/PathesConfiguration';
    }


    /**
     * Renders a path template
     *
     * @private
     * @param {string} template
     * @param {object} variables
     * @param {bool} directReturn
     * @returns {Promise.<string>|string}
     */
    renderTemplate(template, variables, directReturn)
    {
        const data = Object.assign(
            {
                root: this.root,
                cache: this.cache,
                data: this.data,
                sites: this.sites
            }, variables);
        const result = path.resolve(templateString(template, data));
        if (directReturn === true)
        {
            return result;
        }
        return Promise.resolve(result);
    }


    /**
     * The root path for most other pathes
     *
     * Usable within templates via ${root}
     *
     * @type {String}
     */
    get root()
    {
        return this._root;
    }


    /**
     * The root path for the local entoj installation
     *
     * @type {String}
     */
    get entoj()
    {
        return this._entoj;
    }


    /**
     * The cache base path.
     *
     * Usable within path templates via ${cache}
     *
     * @type {String}
     */
    get cache()
    {
        return this._cache;
    }


    /**
     * The data base path.
     *
     * Usable within path templates via ${data}
     *
     * @type {String}
     */
    get data()
    {
        return this._data;
    }


    /**
     * The path to bower components.
     * May be undefined.
     *
     * @type {String}
     */
    get bower()
    {
        return this._bower;
    }


    /**
     * The path to jspm packages.
     * May be undefined.
     *
     * @type {String}
     */
    get jspm()
    {
        return this._jspm;
    }


    /**
     * The sites base path.
     *
     * Usable within path templates via ${templates}
     *
     * @type {String}
     */
    get sites()
    {
        return this._sites;
    }


    /**
     * Resolve a path.
     *
     * This works by analyzing the parameters and deciding which
     * resolve* method should be used.
     *
     * @returns {Promise.<string>}
     */
    resolve()
    {
        if (!arguments.length)
        {
            return Promise.resolve(false);
        }

        // Get path
        let customPath = '';
        if (typeof arguments[arguments.length - 1] === 'string')
        {
            customPath = arguments[arguments.length - 1];
        }

        // Get main vo
        const mainVO = arguments[0];

        // Check Site
        if (mainVO instanceof Site)
        {
            return this.resolveSite(mainVO, customPath);
        }

        // Check EntityId
        if (mainVO instanceof EntityId)
        {
            return this.resolveEntityId(mainVO, customPath);
        }

        // Check Entity
        if (mainVO instanceof Entity)
        {
            return this.resolveEntity(mainVO, customPath);
        }

        // Check template
        if (typeof mainVO === 'string')
        {
            return this.renderTemplate(mainVO, {});
        }

        return Promise.resolve(false);
    }


    /**
     * Shortens a path for display usage
     *
     * @param {string} path
     * @param {number} maxLength
     * @returns {Promise.<string>}
     */
    shorten(path, maxLength)
    {
        let result = path.replace('file://', '').replace(this.root, '');
        if (maxLength)
        {
            result = shortenMiddle(result, maxLength);
        }
        return Promise.resolve(result);
    }


    /**
     * Resolve a Cache path.
     *
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveCache(customPath)
    {
        const result = path.resolve(this.cache + '/' + trimLeadingSlash(customPath));
        return Promise.resolve(result);
    }


    /**
     * Resolve a Data path.
     *
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveData(customPath)
    {
        const result = path.resolve(this.data + '/' + trimLeadingSlash(customPath));
        return Promise.resolve(result);
    }


    /**
     * Resolve a Site path.
     *
     * @param {Site} site
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveSite(site, customPath)
    {
        // Check parameters
        assertParameter(this, 'site', site, true, Site);

        // Resolve path
        return this.renderTemplate(this._siteTemplate + (customPath ? customPath : ''),
            {
                site: site
            });
    }


    /**
     * Resolve a EntityCategory path
     *
     * @param {Site} Site
     * @param {EntityCategory} entityCategory
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveEntityCategory(site, entityCategory, customPath)
    {
        // Check parameters
        assertParameter(this, 'site', site, true, Site);
        assertParameter(this, 'entityCategory', entityCategory, true, EntityCategory);

        // Resolve path
        return this.renderTemplate(this._entityCategoryTemplate + (customPath ? customPath : ''),
            {
                site: site,
                entityCategory: entityCategory
            });
    }


    /**
     * Resolve a EntityId path for a specific site
     *
     * @param {EntityId} entityId
     * @param {Site} site
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveEntityIdForSite(entityId, site, customPath)
    {
        // Check parameters
        assertParameter(this, 'entityId', entityId, true, EntityId);
        assertParameter(this, 'site', site, true, Site);

        let template = this._entityIdTemplate;
        if (entityId.isGlobal)
        {
            template = this._entityIdGlobalTemplate;
        }

        // Resolve path
        return this.renderTemplate(template + (customPath ? customPath : ''),
            {
                site: site,
                entityCategory: entityId.category,
                entityId: entityId
            });
    }


    /**
     * Resolve a EntityId path
     *
     * @param {EntityId} entityId
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveEntityId(entityId, customPath)
    {
        return this.resolveEntityIdForSite(entityId, entityId.site, customPath);
    }


    /**
     * Resolve a Entity path
     *
     * @param {Entity} entity
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveEntity(entity, customPath)
    {
        // Check parameters
        assertParameter(this, 'entity', entity, true, [Entity, EntityAspect]);

        // Resolve path
        return this.resolveEntityId(entity.id, customPath);
    }


    /**
     * Resolve a Entity path for a specific site
     *
     * @param {Entity} entity
     * @param {Site} site
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveEntityForSite(entity, site, customPath)
    {
        // Check parameters
        assertParameter(this, 'entity', entity, true, [Entity, EntityAspect]);
        assertParameter(this, 'site', site, true, Site);

        // Resolve path
        return this.resolveEntityIdForSite(entity.id, site, customPath);
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className} ${this.root}`;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.PathesConfiguration = PathesConfiguration;
