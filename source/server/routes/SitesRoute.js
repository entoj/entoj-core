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
const ContentType = require('../../model/ContentType.js');
const DocumentationCallable = require('../../model/documentation/DocumentationCallable.js').DocumentationCallable;
const Environment = require('../../nunjucks/Environment.js').Environment;
const HtmlFormatter = require('../../formatter/html/HtmlFormatter.js').HtmlFormatter;
const CallParser = require('../../parser/jinja/CallParser.js').CallParser;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const assertParameter = require('../../utils/assert.js').assertParameter;
const fs = require('fs');
const pathes = require('../../utils/pathes.js');
const urls = require('../../utils/urls.js');
const synchronize = require('../../utils/synchronize.js');
const path = require('path');
const shortenLeft = require('../../utils/string.js').shortenLeft;
const unique = require('lodash.uniq');
const co = require('co');


/**
 * @memberOf server.routes
 */
class SitesRoute extends BaseRoute
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
        super(cliLogger.createPrefixed('routes.sitesroute'));

        // Check params
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'urlsConfiguration', urlsConfiguration, true, UrlsConfiguration);
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'buildConfiguration', buildConfiguration, true, BuildConfiguration);

        // Assign options
        const opts = options || {};
        this._entitiesRepository = entitiesRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._urlsConfiguration = urlsConfiguration;
        this._buildConfiguration = buildConfiguration;
        this._rootPath = opts.rootPath || pathesConfiguration.sites;
        this._rootUrl = opts.rootUrl || '/:site/:entityCategory/*';
        this._formatHtml = opts.formatHtml || false;
        this._staticFileExtensions = opts.staticFileExtensions || ['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.woff', '.json', '.ico'];
        this._staticRoutes = opts.staticRoutes || [];
        this._nunjucks = new Environment(this._entitiesRepository, globalConfiguration, this._pathesConfiguration, this._buildConfiguration, { rootPath: this._rootPath });
        this._htmlFormatter = new HtmlFormatter();
        this._jinjaParser = new CallParser();
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, EntitiesRepository, GlobalConfiguration,
            PathesConfiguration, UrlsConfiguration, BuildConfiguration, 'server.routes/SitesRoute.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server.routes/SitesRoute';
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
        //this._cliLogger.info('SiteRoute.handle404: Could not find url ' + request.url);
        next();
    }


    /**
     * @inheritDocs
     */
    handleStatic(rootPath, fileExtensions, log, request, response, next)
    {
        const scope = this;
        //scope._cliLogger.info('handleStatic: from <' + rootPath + '> <' + fileExtensions.join(', ') + '> trying <' + request.url + '>');

        // Check extension
        const extension = path.extname(request.path);
        if (fileExtensions.indexOf(extension) === -1)
        {
            next();
            return;
        }

        // Check straight file
        const filename = pathes.concat(rootPath, request.path);
        if (!fs.existsSync(filename))
        {
            //console.log('Not found:', rootPath, request.path, filename);
            next();
            return;
        }

        // Serve it
        let work;
        if (log)
        {
            const filenameShort = shortenLeft(synchronize.execute(scope._pathesConfiguration, 'shorten', [filename]), 60);
            /*
            response.setHeader("Cache-Control", "public, max-age=2592000");
            response.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
            */
            work = scope._cliLogger.work('Serving static <' + filenameShort + '> as <' + request.url + '>');
        }
        response.sendFile(filename);
        if (work)
        {
            scope._cliLogger.end(work);
        }
        return Promise.resolve(true);
    }


    /**
     * @inheritDocs
     */
    handleTemplate(request, response, next)
    {
        const scope = this;
        const promise = co(function *()
        {
            //scope._cliLogger.info('handleTemplate: from <' + scope._rootPath + '> trying <' + request.url + '>');

            // Check extension
            if (!request.path.endsWith('.j2'))
            {
                next();
                return;
            }

            // Check direct hit
            let filename = pathes.concat(scope._rootPath, request.path);
            if (!fs.existsSync(filename))
            {
                //scope._cliLogger.info('handleTemplate: no direct hit at <' + filename + '>');

                // Check extended file
                const file = yield scope._urlsConfiguration.matchEntityFile(request.path);
                if (!file.file)
                {
                    next();
                    return;
                }
                filename = file.file.filename;
            }

            // Render template
            scope._nunjucks.isStatic = (typeof request.query.static !== 'undefined');
            const data = yield scope._urlsConfiguration.matchEntity(request.path, true);
            const filenameShort = shortenLeft(synchronize.execute(scope._pathesConfiguration, 'shorten', [filename]), 60);
            const work = scope._cliLogger.work('Serving ' + (scope._nunjucks.isStatic ? '<static>' : '') + ' template <' + filenameShort + '> as <' + request.url + '>');
            let html;
            try
            {
                html = scope._nunjucks.render(request.path, data);
            }
            catch (e)
            {
                scope._cliLogger.error(scope.className + '::handleTemplate', e);
                next();
                return;
            }

            // Format
            if (scope._formatHtml)
            {
                const formatted = yield scope._htmlFormatter.format(html);
                response.send(formatted);
                scope._cliLogger.end(work);
            }
            else
            {
                response.send(html);
                scope._cliLogger.end(work);
            }
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

        for (const staticRoute of this._staticRoutes)
        {
            const rootUrl = staticRoute.rootUrl || this._rootUrl;
            let rootPath = this._rootPath;
            if (staticRoute.rootPath)
            {
                rootPath = synchronize.execute(this._pathesConfiguration, 'resolve', [staticRoute.rootPath]);
            }
            const fileExtensions = staticRoute.fileExtensions || [];
            express.all(rootUrl, this.handleStatic.bind(this, rootPath, fileExtensions, true));
        }
        express.all(this._rootUrl, this.handleStatic.bind(this, this._rootPath, this._staticFileExtensions, true));
        if (this._pathesConfiguration.jspm)
        {
            const jspmPath = path.resolve(this._pathesConfiguration.jspm + '/..');
            express.all('/jspm_packages/*', this.handleStatic.bind(this, jspmPath, ['.js'], true));
            express.all('/*', this.handleStatic.bind(this, jspmPath, ['.js'], true));
        }
        express.all(this._rootUrl, this.handleTemplate.bind(this));
        express.all('*', this.handle404.bind(this));

        this._cliLogger.end(work);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.SitesRoute = SitesRoute;
