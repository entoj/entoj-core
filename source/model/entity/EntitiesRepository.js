'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRepository = require('../BaseRepository.js').BaseRepository;
const EntitiesLoader = require('./EntitiesLoader.js').EntitiesLoader;
const IdParser = require('../../parser/entity/IdParser.js').IdParser;
const EntityCategory = require('./EntityCategory.js').EntityCategory;
const Entity = require('./Entity.js').Entity;
const EntityAspect = require('./EntityAspect.js').EntityAspect;
const Site = require('../site/Site.js').Site;
const assertParameter = require('../../utils/assert.js').assertParameter;
const co = require('co');


/**
 * @class
 * @memberOf model.entity
 * @extends {Base}
 */
class EntitiesRepository extends BaseRepository
{
    /**
     * @param {EntityIdParser} entityIdParser
     */
    constructor(entityIdParser, loader)
    {
        super(loader);

        // Check params
        assertParameter(this, 'entityIdParser', entityIdParser, true, IdParser);

        // Assign
        this._entityIdParser = entityIdParser;
        this._entityIdTemplate = this._entityIdParser.idTemplate;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [IdParser, EntitiesLoader] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.entity/EntitiesRepository';
    }


    /**
     * @property {EntityIdParser}
     */
    get entityIdParser()
    {
        return this._entityIdParser;
    }


    /**
     * @protected
     * @returns {Promise.<Array>}
     */
    invalidateFind(query)
    {
        const scope = this;
        const promise = co(function *()
        {
            let result = [];
            if (typeof query == 'string')
            {
                const entity = yield scope.getById(query);
                if (entity)
                {
                    result.push(entity);
                }
            }
            else if (query instanceof Entity)
            {
                const entity = yield scope.getById(query.id);
                if (entity)
                {
                    result.push(entity instanceof EntityAspect ? entity.entity : entity);
                }
            }
            else
            {
                result = yield BaseRepository.prototype.invalidateFind.apply(scope, [query]);
            }
            return result;
        });
        return promise;
    }


    /**
     * @param {Site}
     * @returns {Promise.<Array>}
     */
    getBySite(site)
    {
        // Check params
        assertParameter(this, 'site', site, true, Site);

        // Find
        const scope = this;
        const promise = this.getItems().then(function(data)
        {
            const result = data
                .filter(item => (item.id.site === site || item.usedBy.indexOf(site) > -1))
                .map(item => new EntityAspect(item, site, scope._entityIdTemplate));
            return result;
        });
        return promise;
    }


    /**
     * @param {EntityCategory}
     * @returns {Promise.<Array>}
     */
    getByCategory(entityCategory)
    {
        // Check params
        assertParameter(this, 'entityCategory', entityCategory, true, EntityCategory);

        // Find
        const promise = this.getItems().then(function(data)
        {
            const result = data.filter(item => item.id.category === entityCategory);
            return result;
        });
        return promise;
    }


    /**
     * @param {Site}
     * @param {EntityCategory}
     * @returns {Promise.<Array>}
     */
    getBySiteAndCategory(site, entityCategory)
    {
        // Check params
        assertParameter(this, 'site', site, true, Site);
        assertParameter(this, 'entityCategory', entityCategory, true, EntityCategory);

        // Find
        const scope = this;
        const promise = this.getItems().then(function(data)
        {
            const result = data
                .filter(item => ((item.id.site === site) || item.usedBy.indexOf(site) != -1) && (item.id.category === entityCategory))
                .map(item => new EntityAspect(item, site, scope._entityIdTemplate));
            return result;
        });
        return promise;
    }


    /**
     * @param {string|EntityId}
     * @param [{Site}]
     * @returns {Promise.<Entity>}
     */
    getById(entityId, site)
    {
        const scope = this;
        const promise = co(function *()
        {
            const data = yield scope.getItems();
            let id = entityId;
            if (typeof entityId === 'string')
            {
                const parsedId = yield scope.entityIdParser.parse(entityId);
                id = parsedId.entityId;
            }
            if (site)
            {
                id.site = site;
            }
            const entity = data.find(item => item.id.isEqualTo(id, true));
            if (entity && id && id.site)
            {
                return new EntityAspect(entity, id.site, scope._entityIdTemplate);
            }

            return entity;
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.EntitiesRepository = EntitiesRepository;
