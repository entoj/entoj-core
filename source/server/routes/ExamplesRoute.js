'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRoute = require('./BaseRoute.js').BaseRoute;
const GlobalConfiguration = require('../../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const UrlsConfiguration = require('../../model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const BuildConfiguration = require('../../model/configuration/BuildConfiguration.js').BuildConfiguration;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const Environment = require('../../nunjucks/Environment.js').Environment;
const HtmlFormatter = require('../../formatter/html/HtmlFormatter.js').HtmlFormatter;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const ExamplesArgumentBuilder = require('./ExamplesArgumentBuilder.js').ExamplesArgumentBuilder;
const assertParameter = require('../../utils/assert.js').assertParameter;
const fs = require('fs');
const synchronize = require('../../utils/synchronize.js');
const pathes = require('../../utils/pathes.js');
const urls = require('../../utils/urls.js');
const path = require('path');
const shortenLeft = require('../../utils/string.js').shortenLeft;
const co = require('co');


/**
 * @memberOf server.routes
 */
class ExamplesRoute extends BaseRoute
{
    /**
     * @param {EntitiesRepository} entitiesRepository
     * @param {GlobalConfiguration} globalConfiguration
     * @param {PathesConfiguration} pathesConfiguration
     * @param {UrlsConfiguration} urlsConfiguration
     * @param {object} [options]
     */
    constructor(cliLogger, entitiesRepository, globalConfiguration, pathesConfiguration, urlsConfiguration, buildConfiguration, options)
    {
        super(cliLogger.createPrefixed('routes.examplesroute'));

        // Check params
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'urlsConfiguration', urlsConfiguration, true, UrlsConfiguration);
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'buildConfiguration', buildConfiguration, true, BuildConfiguration);

        // Assign options
        const opts = options || {};
        this._examplesArgumentBuilder = new ExamplesArgumentBuilder(cliLogger);
        this._entitiesRepository = entitiesRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._urlsConfiguration = urlsConfiguration;
        this._buildConfiguration = buildConfiguration;
        this._rootPath = opts.rootPath || pathesConfiguration.sites;
        this._rootUrl = opts.rootUrl || '/:site/:entityCategory/:entityId/styleguide';
        this._formatHtml = opts.formatHtml || false;
        this._nunjucks = new Environment(this._entitiesRepository, globalConfiguration, this._pathesConfiguration, this._buildConfiguration, { rootPath: this._rootPath });
        this._htmlFormatter = new HtmlFormatter();
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, EntitiesRepository, GlobalConfiguration,
            PathesConfiguration, UrlsConfiguration, BuildConfiguration, 'server.routes/ExamplesRoute.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server.routes/ExamplesRoute';
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
    handleExample(request, response, next)
    {
        const scope = this;
        const promise = co(function *()
        {
            const match = yield scope._urlsConfiguration.matchEntityId(request.url, true);
            if (!match ||
                !match.entityId ||
                match.customPath !== '/styleguide')
            {
                next();
                return false;
            }

            const work = scope._cliLogger.work('Serving sytleguide for <' + match.entityId.asString() + '> as <' + request.url + '>');
            const entity = yield scope._entitiesRepository.getById(match.entityId);
            try
            {
                //scope._nunjucks.isStatic = true;
                const template = yield scope._examplesArgumentBuilder.buildTemplate(entity);
                const html = scope._nunjucks.renderString(template, match);
                scope._nunjucks.isStatic = false;
                response.send(html);
                scope._cliLogger.end(work);
            }
            catch(e)
            {
                console.log(e, e.stack);
                scope._cliLogger.end(work, e);
                next();
            }

            return true;
        })
        .catch(function(error)
        {
            scope.logger.error(scope.className + '::handleExample', error.stack);
        });
        return promise;
    }


    /**
     * @param {Express}
     */
    register(express)
    {
        const work = this._cliLogger.work('Registering <' + this.className + '> as middleware');
        express.all(this._rootUrl, this.handleExample.bind(this));
        this._cliLogger.end(work);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ExamplesRoute = ExamplesRoute;
