'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const SitesRepository = require('./site/SitesRepository.js').SitesRepository;
const EntityCategoriesRepository = require('./entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const EntitiesRepository = require('./entity/EntitiesRepository.js').EntitiesRepository;
const EntityCategory = require('./entity/EntityCategory.js').EntityCategory;
const Site = require('./site/Site.js').Site;
const ContentType = require('./ContentType.js');
const assertParameter = require('../utils/assert.js').assertParameter;
const co = require('co');


/**
 * @class
 * @memberOf model
 * @extends {BaseRepository}
 */
class GlobalRepository extends Base
{
    /**
     * @param {EntityIdParser} entityIdParser
     */
    constructor(sitesRepository, entityCategoriesRepository, entitiesRepository)
    {
        super();

        // Check params
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'entityCategoriesRepository', entityCategoriesRepository, true, EntityCategoriesRepository);
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);

        // Assign
        this._sitesRepository = sitesRepository;
        this._entityCategoriesRepository = entityCategoriesRepository;
        this._entitiesRepository = entitiesRepository;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [SitesRepository, EntityCategoriesRepository, EntitiesRepository] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model/GlobalRepository';
    }


    /**
     * @inheritDocs
     */
    resolve(query)
    {
        const scope = this;
        const promise = co(function*()
        {
            let site;
            let entityCategory;
            let entity;
            const parts = query && query.length ? query.split('/') : ['*'];

            if (parts.length == 1)
            {
                // Check *
                if (query === '*')
                {
                    site = yield scope._sitesRepository.getItems();
                    return { site: site };
                }

                // Check site
                site = yield scope._sitesRepository.findBy(Site.ANY, query);
                if (site)
                {
                    return { site: site };
                }

                // Check category
                entityCategory = yield scope._entityCategoriesRepository.findBy(EntityCategory.ANY, query);
                if (entityCategory)
                {
                    return { entityCategory: entityCategory };
                }
            }

            if (parts.length == 2)
            {
                // Check site / category
                site = yield scope._sitesRepository.findBy('name', parts[0].trim());
                if (site)
                {
                    entityCategory = yield scope._entityCategoriesRepository.findBy(EntityCategory.ANY, parts[1].trim());
                    if (entityCategory)
                    {
                        return { site: site, entityCategory: entityCategory };
                    }
                }
            }

            if (parts.length == 1 || parts.length == 3)
            {
                // Check entity
                entity = yield scope._entitiesRepository.getById(query);
                if (entity)
                {
                    return { entity: entity };
                }
            }

            return undefined;
        });
        return promise;
    }


    /**
     * @inheritDocs
     */
    resolveEntities(query)
    {
        const scope = this;
        const promise = co(function*()
        {
            const result = [];
            const queryResult = yield scope.resolve(query);

            // Check if result
            if (!queryResult)
            {
                return result;
            }

            // Check site
            if (queryResult.site && !queryResult.entityCategory)
            {
                const sites = Array.isArray(queryResult.site) ? queryResult.site : [queryResult.site];
                for (const site of sites)
                {
                    const siteEntities = yield scope._entitiesRepository.getBySite(site);
                    Array.prototype.push.apply(result, siteEntities);
                }
            }

            // Check category
            if (queryResult.entityCategory && !queryResult.site)
            {
                const entityCategories = Array.isArray(queryResult.entityCategory) ? queryResult.entityCategory : [queryResult.entityCategory];
                for (const entityCategory of entityCategories)
                {
                    const entityCategoryEntities = yield scope._entitiesRepository.getByCategory(entityCategory);
                    Array.prototype.push.apply(result, entityCategoryEntities);
                }
            }

            // Check site + category
            if (queryResult.entityCategory && queryResult.site)
            {
                const siteEntityCategoryEntities = yield scope._entitiesRepository.getBySiteAndCategory(queryResult.site, queryResult.entityCategory);
                Array.prototype.push.apply(result, siteEntityCategoryEntities);
            }

            // Check entity
            if (queryResult.entity)
            {
                result.push(queryResult.entity);
            }

            return result;
        });
        return promise;
    }


    /**
     * @returns {Promise<Object>}
     */
    resolveMacro(siteQuery, macroQuery)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Get site
            let site = (siteQuery instanceof Site) ? siteQuery : yield scope._sitesRepository.findBy(Site.ANY, siteQuery);
            if (!site && !siteQuery)
            {
                site = yield scope._sitesRepository.getFirst();
            }
            if (!site)
            {
                return false;
            }

            // Get entities
            const entities = yield scope._entitiesRepository.getBySite(site);

            // Find macro
            for (const entity of entities)
            {
                const macro = entity.documentation.find((doc) =>
                {
                    return doc.contentType === ContentType.JINJA &&
                           doc.name === macroQuery;
                });
                if (macro)
                {
                    return macro;
                }
            }

            return false;
        });
        return promise;
    }


    /**
     * @returns {Promise<Object>}
     */
    resolveEntityForMacro(siteQuery, macroQuery)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Get site
            let site = (siteQuery instanceof Site) ? siteQuery : yield scope._sitesRepository.findBy(Site.ANY, siteQuery);
            if (!site && !siteQuery)
            {
                site = yield scope._sitesRepository.getFirst();
            }
            if (!site)
            {
                return false;
            }

            // Get entities
            const entities = yield scope._entitiesRepository.getBySite(site);

            // Find entity
            for (const entity of entities)
            {
                const macro = entity.documentation.find((doc) =>
                {
                    return doc.contentType === ContentType.JINJA &&
                           doc.name === macroQuery;
                });
                if (macro)
                {
                    return entity;
                }
            }

            return false;
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.GlobalRepository = GlobalRepository;
