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
const SitesRepository = require('../../model/site/SitesRepository.js').SitesRepository;
const Environment = require('../../nunjucks/Environment.js').Environment;
const HtmlFormatter = require('../../formatter/html/HtmlFormatter.js').HtmlFormatter;
const CallParser = require('../../parser/jinja/CallParser.js').CallParser;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const assertParameter = require('../../utils/assert.js').assertParameter;
const fs = require('fs');
const pathes = require('../../utils/pathes.js');
const synchronize = require('../../utils/synchronize.js');
const path = require('path');
const shortenLeft = require('../../utils/string.js').shortenLeft;
const co = require('co');


/**
 * @memberOf server.routes
 */
class ContentsRoute extends BaseRoute
{
    /**
     * @param {cli.CliLogger} cliLogger
     * @param {model.entity.EntitiesRepository} entitiesRepository
     * @param {model.configuration.GlobalConfiguration} globalConfiguration
     * @param {model.configuration.PathesConfiguration} pathesConfiguration
     * @param {model.configuration.UrlsConfiguration} urlsConfiguration
     * @param {model.configuration.BuildConfiguration} buildConfiguration
     * @param {nunjucks.Environment} nunjucks
     * @param {object} [options]
     */
    constructor(cliLogger, sitesRepository, globalConfiguration, pathesConfiguration, buildConfiguration, nunjucks, options)
    {
        super(cliLogger.createPrefixed('routes.contentsroute'));

        // Check params
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'buildConfiguration', buildConfiguration, true, BuildConfiguration);
        assertParameter(this, 'nunjucks', nunjucks, true, Environment);

        // Assign options
        const opts = options || {};
        this._sitesRepository = sitesRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._buildConfiguration = buildConfiguration;
        this._nunjucks = nunjucks;
        this._path = opts.path || pathesConfiguration.sites;
        this._rootUrl = opts.rootUrl || '/:site/contents/*';
        this._formatHtml = opts.formatHtml || false;
        this._htmlFormatter = new HtmlFormatter();

        // Configure nunjucks
        this._nunjucks.path = this._path;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, SitesRepository, GlobalConfiguration,
            PathesConfiguration, BuildConfiguration, Environment, 'server.routes/ContentsRoute.options'] };

    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server.routes/ContentsRoute';
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
    handleTemplate(request, response, next)
    {
        const scope = this;
        const promise = co(function *()
        {
            scope._cliLogger.info('handleTemplate: from <' + scope._path + '> trying <' + request.url + '>');

            // Get site
            const site = yield scope._sitesRepository.findBy(['name'], request.params.site);
            if (!site)
            {
                next();
                return;
            }

            console.log(request.params.site, site);

            // Check direct hit
            const basePath = yield scope._pathesConfiguration.resolveSite(site, '/contents');
            const filename = pathes.concat(basePath, request.params['0']) + '.j2';
            console.log(filename);
            if (!fs.existsSync(filename))
            {
                next();
                return;
            }

            // Render template
            const tpl = fs.readFileSync(filename, { encoding: 'utf8' });
            const work = scope._cliLogger.work('Serving template <' + request.url + '>');
            let html;
            try
            {
                scope._nunjucks.addGlobal('site', site);
                scope._nunjucks.addGlobal('request', request);
                html = scope._nunjucks.renderString(tpl);
            }
            catch (e)
            {
                scope._cliLogger.error(scope.className + '::handleTemplate', e);
                next();
                return;
            }

            response.send(html);
            scope._cliLogger.end(work);

            return true;
        })
        .catch(function(error)
        {
            scope._cliLogger.error(scope.className + '::handleTemplate', error.stack);
        });
        return promise;
    }


    /**
     * @param {Express}
     */
    register(express)
    {
        const work = this._cliLogger.work('Registering <' + this.className + '> as middleware');

        express.get(this._rootUrl, this.handleTemplate.bind(this));

        this._cliLogger.end(work);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ContentsRoute = ContentsRoute;
