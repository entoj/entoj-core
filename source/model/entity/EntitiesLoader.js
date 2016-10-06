'use strict';

/**
 * Requirements
 * @ignore
 */
const PluggableLoader = require('../loader/PluggableLoader.js').PluggableLoader;
const PathesConfiguration = require('../configuration/PathesConfiguration.js').PathesConfiguration;
const IdParser = require('../../parser/entity/IdParser.js').IdParser;
const Entity = require('./Entity.js').Entity;
const EntityCategoriesRepository = require('./EntityCategoriesRepository.js').EntityCategoriesRepository;
const SitesRepository = require('../site/SitesRepository.js').SitesRepository;
const assertParameter = require('../../utils/assert.js').assertParameter;
const co = require('co');
const fs = require('co-fs-extra');


/**
 * @class
 * @memberOf mode.site
 * @extends {BaseLoader}
 */
class EntitiesLoader extends PluggableLoader
{
    /**
     * @param {SitesRepository} sitesRepository
     * @param {EntityCategoriesRepository} entityCategoriesRepository
     * @param {IdParser} idParser
     * @param {PathesConfiguration} pathesConfiguration
     * @param {Array} plugins
     */
    constructor(sitesRepository, entityCategoriesRepository, entityIdParser, pathesConfiguration, plugins)
    {
        super(plugins);

        //Check params
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'entityCategoriesRepository', entityCategoriesRepository, true, EntityCategoriesRepository);
        assertParameter(this, 'entityIdParser', entityIdParser, true, IdParser);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._pathesConfiguration = pathesConfiguration;
        this._entityCategoriesRepository = entityCategoriesRepository;
        this._sitesRepository = sitesRepository;
        this._entityIdParser = entityIdParser;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [SitesRepository, EntityCategoriesRepository, IdParser, PathesConfiguration, 'model.entity/EntitiesLoader.plugins'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.entity/EntitiesLoader';
    }


    /**
     * Loads all basic entities informations
     *
     * @returns {Promise.<Array>}
     */
    readEntityDirectories()
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const result = [];
            const categories = yield scope._entityCategoriesRepository.getItems();
            const sites = yield scope._sitesRepository.getItems();

            // Read each site
            for (const site of sites)
            {
                const sitePath = yield scope._pathesConfiguration.resolveSite(site);
                const sitePathExists = yield fs.exists(sitePath);
                if (sitePathExists)
                {
                    // Read each category
                    for (const category of categories)
                    {
                        const categoryPath = yield scope._pathesConfiguration.resolveEntityCategory(site, category);
                        const categoryPathExists = yield fs.exists(categoryPath);
                        if (categoryPathExists)
                        {
                            const categoryName = categoryPath.replace(scope._pathesConfiguration.sites, '');
                            let entityId;

                            // Global category
                            if (category.isGlobal)
                            {
                                result.push(categoryName);
                            }
                            // Read entities
                            else
                            {
                                const directories = yield fs.readdir(categoryPath);
                                for (const entityName of directories)
                                {
                                    entityId = yield scope._entityIdParser.parse(categoryName + '/' + entityName);
                                    if (entityId && (entityId.entityName.length || entityId.entityNumber))
                                    {
                                        result.push(categoryName + '/' + entityName);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return result;
        });

        return promise;
    }


    /**
     * @inheritDocs
     */
    loadItems(items)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const result = [];
            const ids = {};
            let entityPathes;

            // Get pathes
            if (Array.isArray(items))
            {
                entityPathes = items;
            }
            else
            {
                entityPathes = yield scope.readEntityDirectories();
            }

            // Read entityPathes
            for (const entityPath of entityPathes)
            {
                // Check id
                const entityId = yield scope._entityIdParser.parse(entityPath);
                if (!entityId)
                {
                    continue;
                }

                // Check extends
                if (entityId.site && entityId.site.extends && typeof ids[entityId.idString] !== 'undefined')
                {
                    continue;
                }

                let entity;
                // Check entity
                if (entityId && entityId.site && (entityId.entityName.length || entityId.entityNumber))
                {
                    entity = new Entity(entityId.entityId);
                }
                // Global category
                else if (entityId && entityId.site && entityId.entityCategory && entityId.entityCategory.isGlobal)
                {
                    entity = new Entity(entityId.entityId);
                }

                if (entity)
                {
                    result.push(entity);
                    ids[entityId.idString] = entity;
                }
            }

            // Apply site extend
            const sites = yield scope._sitesRepository.getItems();
            for (const site of sites)
            {
                if (site.extends)
                {
                    for (const entity of result)
                    {
                        if (entity.id.site === site.extends)
                        {
                            entity.usedBy.push(site);
                        }
                    }
                }
            }

            return result;
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.EntitiesLoader = EntitiesLoader;
