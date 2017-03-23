'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRoute = require('./BaseRoute.js').BaseRoute;
const UrlsConfiguration = require('../../model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const GlobalConfiguration = require('../../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../../model/configuration/BuildConfiguration.js').BuildConfiguration;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const EntityCategoriesRepository = require('../../model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const SitesRepository = require('../../model/site/SitesRepository.js').SitesRepository;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const Environment = require('../../nunjucks/Environment.js').Environment;
const assertParameter = require('../../utils/assert.js').assertParameter;
const synchronize = require('../../utils/synchronize.js').synchronize;
const fs = require('fs');


/**
 * @memberOf server.routes
 */
class PagesRoute extends BaseRoute
{
    /**
     * @param {cli.CliLogger} cliLogger
     * @param {model.site.SitesRepository} sitesRepository
     * @param {model.entity.EntityCategoriesRepository} entityCategoriesRepository
     * @param {model.entity.EntitiesRepository} entitiesRepository
     * @param {model.configuration.GlobalConfiguration} globalConfiguration
     * @param {model.configuration.UrlsConfiguration} urlsConfiguration
     * @param {model.configuration.PathesConfiguration} pathesConfiguration
     * @param {model.configuration.BuildConfiguration} buildConfiguration
     * @param {nunjucks.Environment} nunjucks
     * @param {array} routes
     * @param {object} [options]
     */
    constructor(cliLogger, sitesRepository, entityCategoriesRepository, entitiesRepository, globalConfiguration,
                urlsConfiguration, pathesConfiguration, buildConfiguration, nunjucks, routes, options)
    {
        super(cliLogger.createPrefixed('routes.pagesroute'));

        // Check params
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'entityCategoriesRepository', entityCategoriesRepository, true, EntityCategoriesRepository);
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'urlsConfiguration', urlsConfiguration, true, UrlsConfiguration);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'buildConfiguration', buildConfiguration, true, BuildConfiguration);
        assertParameter(this, 'nunjucks', nunjucks, true, Environment);

        // Assign options
        this._sitesRepository = synchronize(sitesRepository);
        this._entityCategoriesRepository = synchronize(entityCategoriesRepository);
        this._entitiesRepository = synchronize(entitiesRepository);
        this._urlsConfiguration = synchronize(urlsConfiguration);
        this._pathesConfiguration = pathesConfiguration;
        this._buildConfiguration = buildConfiguration;
        this._nunjucks = nunjucks;

        // Routes
        this._routes = [];
        if (routes && Array.isArray(routes))
        {
            for (const routeConfig of routes)
            {
                const route =
                {
                    url: routeConfig.url || '/',
                    template: routeConfig.template || 'index.j2'
                };
                this._routes.push(route);
            }
        }

        // Options
        const opts = options || {};
        this._templateRoot = opts.templateRoot || __dirname;
        this._staticRoute = opts.staticRoute || '/internal';

        // Configure nunjucks
        this._nunjucks.path = this._templateRoot;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, SitesRepository, EntityCategoriesRepository, EntitiesRepository,
                                GlobalConfiguration, UrlsConfiguration, PathesConfiguration, BuildConfiguration, Environment, 'server.routes/PagesRoute.routes', 'server.routes/PagesRoute.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server.routes/PagesRoute';
    }


    /**
     * @inheritDocs
     */
    get nunjucks()
    {
        return this._nunjucks;
    }


    /**
     * @inheritDocs
     */
    handle404(request, response, next)
    {
        //this._cliLogger.info('Could not find url ' + request.url);
        next();
    }


    /**
     * @inheritDocs
     */
    handleStatic(request, response, next)
    {
        const filename = this._templateRoot + '/' + request.path.replace(this._staticRoute + '/', '');
        if (!fs.existsSync(filename))
        {
            next();
            return;
        }
        //const filenameShort = synchronizeExecute(this._pathesConfiguration, 'shorten', [filename]);
        //const work = this._cliLogger.work('Serving static <' + filenameShort + '> as <' + request.url + '>');
        response.sendFile(filename);
        //this._cliLogger.end(work);
    }


    /**
     * @inheritDocs
     */
    handlePage(route, request, response, next)
    {
        //this._cliLogger.info('PagesRoute: handlePage for ' + request.url);

        const model =
        {
            sites: this._sitesRepository,
            entityCategories: this._entityCategoriesRepository,
            entities: this._entitiesRepository,
            urls: this._urlsConfiguration,
            type:
            {
                DocumentationText: 'DocumentationText',
                DocumentationExample: 'DocumentationExample',
                DocumentationDatamodel: 'DocumnentationDatamodel'
            },
            kind:
            {
                MACRO: 'macro',
                EXAMPLE: 'example',
                DATAMODEL: 'datamodel'
            },
            location:
            {
                url: request.url
            }
        };

        // Create a short url for simple model matches
        const url = request.url.split('/').slice(0, 4).join('/');

        // Get site
        const site = this._urlsConfiguration.matchSite(url, true);
        //console.log('Site', url, site);
        if (site)
        {
            model.location.site = site.site;
        }

        // Get entityCategory
        const entityCategory = this._urlsConfiguration.matchEntityCategory(url, true);
        //console.log('EntityCategory', url, entityCategory);
        if (entityCategory)
        {
            model.location.entityCategory = entityCategory.entityCategory;
        }

        // Get entity
        const entity = this._urlsConfiguration.matchEntityId(url);
        //console.log('Entity', url, entity);
        if (entity)
        {
            model.location.entity = entity.entity;
        }

        if (request.params.modelFile) {
            model.location.modelFile = request.params.modelFile;
        }

        // Check if valid page
        if (request.params.entityId === 'examples')
        {
            next();
            return;
        }
        if (request.params.site && !model.location.site)
        {
            next();
            return;
        }
        if (!request.params.entityId && request.params.entityCategory && !model.location.entityCategory)
        {
            next();
            return;
        }
        if (request.params.entityId && !model.location.entity)
        {
            next();
            return;
        }

        const work = this._cliLogger.work('Serving template <' + route.template + '> for <' + request.url + '>');
        const tpl = fs.readFileSync(this._templateRoot + '/' + route.template, { encoding: 'utf8' });
        this._nunjucks.addGlobal('request', request);
        const html = this._nunjucks.renderString(tpl, { global: model });
        response.send(html);
        this._cliLogger.end(work);
    }


    /**
     * @param {Express}
     */
    register(express)
    {
        const work = this._cliLogger.work('Registering <' + this.className + '> as middleware');

        for (const route of this._routes)
        {
            this._cliLogger.info('Adding rout <' + route.url + '>');
            express.get(route.url, this.handlePage.bind(this, route));
        }
        express.get(this._staticRoute + '/*', this.handleStatic.bind(this));
        express.all('*', this.handle404.bind(this));

        this._cliLogger.end(work);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.PagesRoute = PagesRoute;
