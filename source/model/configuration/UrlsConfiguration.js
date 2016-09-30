'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const Site = require('../site/Site.js').Site;
const SitesRepository = require('../site/SitesRepository.js').SitesRepository;
const EntityCategory = require('../entity/EntityCategory.js').EntityCategory;
const EntityCategoriesRepository = require('../entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const EntitiesRepository = require('../entity/EntitiesRepository.js').EntitiesRepository;
const Entity = require('../entity/Entity.js').Entity;
const EntityId = require('../entity/EntityId.js').EntityId;
const IdParser = require('../../parser/entity/IdParser.js').IdParser;
const PathesConfiguration = require('../configuration/PathesConfiguration.js').PathesConfiguration;
const assertParameter = require('../../utils/assert.js').assertParameter;
const templateString = require('es6-template-strings');
const co = require('co');
const routes = require('routes');
const urlify = require('../../utils/urls.js').urlify;
const pathes = require('../../utils/pathes.js');
const urls = require('../../utils/urls.js');
require('../../utils/prototypes.js');


/**
 * Holds all url related configuration.
 *
 * Most url are configured via template strings
 *
 * @memberOf model.configuration
 */
class UrlsConfiguration extends Base
{
    /**
     * @param {object} options
     */
    constructor(options, sitesRepository, entityCategoriesRepository, entitiesRepository, entityIdParser, pathesConfiguration)
    {
        super();

        // Check parameters
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'entityCategoriesRepository', entityCategoriesRepository, true, EntityCategoriesRepository);
        assertParameter(this, 'entitiesCategory', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'entityIdParser', entityIdParser, true, IdParser);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, false, PathesConfiguration);

        // Add parameters
        this._sitesRepository = sitesRepository;
        this._entityCategoriesRepository = entityCategoriesRepository;
        this._entitiesRepository = entitiesRepository;
        this._entityIdParser = entityIdParser;
        this._pathesConfiguration = pathesConfiguration;

        // Get options
        const opts = options || {};
        this._root = opts.root || '';
        this._siteTemplate = opts.siteTemplate || '${root}/${site.name.toLowerCase()}';
        this._sitePattern = opts.sitePattern || '${root}/:site';
        this._entityCategoryTemplate = opts.entityCategoryTemplate || '${root}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}';
        this._entityCategoryPattern = opts.entityCategoryPattern || '${root}/:site/:entityCategory';
        this._entityIdTemplate = opts.entityIdTemplate || '${root}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}/${entityCategory.shortName.toLowerCase()}${entityId.number}-${entityId.name.toLowerCase()}';
        this._entityIdPattern = opts._entityIdPattern || '${root}/:site/:entityCategory/:entityId';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['model.configuration/UrlsConfiguration.options', SitesRepository,
            EntityCategoriesRepository, EntitiesRepository, IdParser, PathesConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.configuration/UrlsConfiguration';
    }


    /**
     * Renders a path template
     *
     * @private
     * @param {string} template
     * @param {object} variables
     * @returns {Promise.<string>|string}
     */
    renderTemplate(template, variables)
    {
        const data = Object.assign(
            {
                root: this.root
            }, variables);
        const result = templateString(template, data);
        return Promise.resolve(result);
    }


    /**
     * Match a url and returns a object that contains any matched objects for:
     *  - site
     *  - entity category
     *  - entity
     *
     * @param {string} url
     * @returns {Promise.<Template>}
     */
    match(value, patternTemplate)
    {
        const scope = this;
        const promise = co(function *()
        {
            const pattern = yield scope.renderTemplate(patternTemplate);
            const match = routes.match([routes.Route(pattern)], value);
            if (match)
            {
                const result =
                {
                    url: value,
                    params: match.params
                };
                if (match.params.site && match.params.site.length)
                {
                    result.site = yield scope._sitesRepository.findBy(Site.NAME, match.params.site);
                }
                if (match.params.entityCategory && match.params.entityCategory.length)
                {
                    result.entityCategory = yield scope._entityCategoriesRepository.findBy(EntityCategory.ANY, match.params.entityCategory, function(value, searched)
                    {
                        return urlify(value) === searched;
                    });
                }
                if (match.params.entityId && match.params.entityId.length)
                {
                    result.entity = yield scope._entitiesRepository.getById(value);
                    if (result.entity)
                    {
                        result.entityId = result.entity.id;
                    }
                    else
                    {
                        result.entityId = yield scope._entityIdParser.parse(match.params.entityId);
                        if (result.entityId && result.site)
                        {
                            result.entityId.site = result.site;
                        }
                    }
                }
                if (match.splats && match.splats.length > 0 && match.splats[0])
                {
                    result.customPath = urls.normalize(pathes.normalize(match.splats[0]));
                }
                //console.log('Match:', result);
                return result;
            }
            return false;
        })
        .catch(function(error)
        {
            scope.logger.error(scope.className + '::match', error.stack);
        });
        return promise;
    }


    /**
     * Resolve a filename to a url.
     *
     * @param {string} file
     * @returns {Promise.<string>}
     */
    resolveFilename(filename)
    {
        const basePath = (this._pathesConfiguration ? this._pathesConfiguration.sites :  '');
        const filePath = filename.replace(basePath, '');
        return Promise.resolve(urls.normalize(filePath));
    }


    /**
     * Resolve a template url.
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
     * Match a site path.
     *
     * @param {string} url
     * @param {bool} [partial] Matches partial urls
     * @returns {Promise.<Site>}
     */
    matchSite(url, partial)
    {
        return this.match(url + (partial ? '/' : ''), this._sitePattern + (partial ? '/*?' : ''));
    }


    /**
     * Resolve a entity category.
     *
     * @param {Site} site
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
     * Match a entity category path.
     *
     * @param {string} url
     * @param {bool} [partial] Matches partial urls
     * @returns {Promise.<EntityCategory>}
     */
    matchEntityCategory(url, partial)
    {
        return this.match(url + (partial ? '/' : ''), this._entityCategoryPattern + (partial ? '/*?' : ''));
    }


    /**
     * Resolve a entity id url.
     *
     * @param {EntityId} entityId
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveEntityId(entityId, customPath)
    {
        // Check parameters
        assertParameter(this, 'entityId', entityId, true, EntityId);

        // Resolve path
        let template = this._entityIdTemplate;
        if (entityId.isGlobal)
        {
            template = this._entityCategoryTemplate;
        }
        return this.renderTemplate(template + (customPath ? customPath : ''),
            {
                site: entityId.site,
                entityCategory: entityId.category,
                entityId: entityId
            });
    }


    /**
     * Match a template path.
     *
     * @param {string} url
     * @param {bool} [partial] Matches partial urls
     * @returns {Promise.<EntityId>}
     */
    matchEntityId(url, partial)
    {
        return this.match(url + (partial ? '/' : ''), this._entityIdPattern + (partial ? '/*?' : ''));
    }


    /**
     * Resolve a entity url.
     *
     * @param {Entity} entity
     * @param {Site} site
     * @param {string} customPath
     * @returns {Promise.<string>}
     */
    resolveEntity(entity, site, customPath)
    {
        // Check parameters
        assertParameter(this, 'entity', entity, true, Entity);
        return this.resolveEntityId(entity.id, site, customPath);
    }


    /**
     * Match a template path.
     *
     * @param {string} url
     * @param {bool} [partial] Matches partial urls
     * @returns {Promise.<EntityId>}
     */
    matchEntity(url, partial)
    {
        return this.matchEntityId(url, partial);
    }


    /**
     * Match a entity file url.
     *
     * @param {string} url
     * @returns {Promise.<EntityId>}
     */
    matchEntityFile(url)
    {
        const scope = this;
        const promise = this.matchEntityId(url, true)
            .then(function(result)
            {
                if (result.entity && result.customPath)
                {
                    //console.log(scope.className + '::matchEntityFile url', url);
                    for (const file of result.entity.files)
                    {
                        const basePath = (scope._pathesConfiguration ? scope._pathesConfiguration.sites :  '');
                        const fileUrl = urls.shift(file.filename.replace(basePath, ''));
                        if (fileUrl === urls.shift(url))
                        {
                            //console.log(scope.className + '::matchEntityFile hit', file);
                            result.file = file;
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
module.exports.UrlsConfiguration = UrlsConfiguration;
