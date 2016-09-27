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
     * @returns {Promise}
     */
    getMacroInclude(name)
    {
        const items = synchronize.execute(this._entitiesRepository, 'getItems');
        for (const item of items)
        {
            const macros = item.documentation.filter(doc => doc.contentType == ContentType.JINJA && doc instanceof DocumentationCallable);
            for (const macro of macros)
            {
                if (macro.name === name)
                {
                    return '{% include "' + urls.normalize(macro.file.filename.replace(this._pathesConfiguration.sites, '')) + '" %}';
                }
            }
        }

        return false;
    }


    /**
     * @inheritDocs
     */
    prepareTemplate(template)
    {
        //const workParse = this._cliLogger.work('Parsing Template');
        const scope = this;
        const promise = this._jinjaParser.parse(template)
            .then(function(macros)
            {
                //scope._cliLogger.end(workParse);

                // Get includes
                //const workIncludes = scope._cliLogger.work('Preparing Template includes');
                let includes = [];
                for (const macro of macros)
                {
                    const include = scope.getMacroInclude(macro);
                    if (include)
                    {
                        includes.push(include);
                    }
                }
                includes = unique(includes);

                // Update template
                let result = template;
                for (const include of includes)
                {
                    result = include + '\n' + result;
                }
                //scope._cliLogger.end(workIncludes);

                return result;
            })
            .catch(function(e)
            {
                scope._cliLogger.error('prepareTemplate failed', e);
            });
        return promise;
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
                match.customPath !== '/examples/overview')
            {
                next();
                return false;
            }

            next();
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
