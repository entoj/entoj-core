'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const UrlsConfiguration = require('../model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const Environment = require('../nunjucks/Environment.js').Environment;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const pathes = require('../utils/pathes.js');
const urls = require('../utils/urls.js');
const templateString = require('es6-template-strings');
const through2 = require('through2');
const VinylFile = require('vinyl');
const co = require('co');
const PATH_SEPERATOR = require('path').sep;


/**
 * Parameters:
 *     query - Restricts the source entities to the given query (see GlobalRepository.resolve)
 *
 * Properties:
 *     release.html
 *         filename
 *         macro
 *         type
 *
 * @memberOf task
 */
class RenderHtmlTask extends BaseTask
{
    /**
     *
     */
    constructor(cliLogger, globalRepository, pathesConfiguration, urlsConfiguration, nunjucks)
    {
        super(cliLogger);

        //Check params
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'urlsConfiguration', urlsConfiguration, true, UrlsConfiguration);
        assertParameter(this, 'nunjucks', nunjucks, true, Environment);

        // Assign options
        this._globalRepository = globalRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._urlsConfiguration = urlsConfiguration;
        this._nunjucks = nunjucks;

        // Configure nunjucks path
        this._nunjucks.path = this._pathesConfiguration.sites;
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, GlobalRepository, PathesConfiguration, UrlsConfiguration, Environment] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/RenderHtmlTask';
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const result = super.prepareParameters(buildConfiguration, parameters);
        result.query = result.query || '*';
        result.filepathTemplate = typeof result.filepathTemplate === 'string' ? result.filepathTemplate : '${entity.pathString}';
        return result;
    }


    /**
     * @returns {Promise<VinylFile>}
     */
    renderEntity(entity, entitySettings, buildConfiguration, parameters)
    {
        if (!entity)
        {
            this.logger.warn(this.className + '::renderEntity - No entity given');
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const settings = entitySettings || {};
            const params = scope.prepareParameters(buildConfiguration, parameters);
            const macroName = settings.macro || entity.idString.lodasherize();
            const macroParameters = settings.parameters || {};
            const filepath = pathes.normalizePathSeperators(templateString(params.filepathTemplate,
                {
                    entity: entity,
                    entityId: entity.id,
                    site: entity.id.site,
                    entityCategory: entity.id.category
                }));
            const entityPath = entity.pathString + '/' + entity.idString;

            // Generate filename
            let filename;
            if (settings.filename)
            {
                filename = pathes.normalizePathSeperators(settings.filename);

                // Add entity path if necessary
                if (filename.indexOf(PATH_SEPERATOR) == '-1')
                {
                    filename = pathes.trimLeadingSlash(filepath + PATH_SEPERATOR + filename);
                }

                // Add .html if necessary
                if (!filename.endsWith('.html'))
                {
                    filename+= '.html';
                }
            }
            else
            {
                filename = pathes.trimLeadingSlash(filepath + PATH_SEPERATOR + entity.idString + '.html');
            }

            // Create template
            let template = '';
            switch(settings.type)
            {
                case 'template':
                    const extend = yield scope._urlsConfiguration.matchEntityFile(entityPath + '.j2');
                    if (extend && extend.file)
                    {
                        const extendsPath = extend.file.filename.replace(scope._pathesConfiguration.sites, '');
                        template+= '{% extends "' + urls.trimLeadingSlash(extendsPath) + '" %}\n';
                    }
                    break;

                case 'page':
                    const include = yield scope._urlsConfiguration.matchEntityFile(entityPath + '.j2');
                    if (include && include.file)
                    {
                        const includePath = include.file.filename.replace(scope._pathesConfiguration.sites, '');
                        template+= '{% include "' + urls.trimLeadingSlash(includePath) + '" %}\n';
                    }
                    break;

                default:
                    template+= '{{ ' + macroName + '(';
                    const renderedParameters = [];
                    for (const key in macroParameters)
                    {
                        let value = macroParameters[key];
                        if (typeof value == 'string')
                        {
                            value = '\'' + value + '\'';
                        }
                        renderedParameters.push(key + '=' + value);
                    }
                    template+= renderedParameters.join(', ') + ') }}';
                    break;
            }

            // Compile
            const work = scope._cliLogger.work('Rendering template to html for <' + entity.idString + '> as <' + filename + '>');
            const data = { site: entity.site, entity: entity };
            const contents = scope._nunjucks.renderString(template, data);
            scope._cliLogger.end(work);

            // Done
            const file = new VinylFile(
                {
                    path: filename,
                    contents: new Buffer(contents)
                });
            return file;
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Array>}
     */
    renderEntities(buildConfiguration, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const params = scope.prepareParameters(buildConfiguration, parameters);

            // Compile each entity
            const result = [];
            const entities = yield scope._globalRepository.resolveEntities(params.query);
            for (const entity of entities)
            {
                // Render each configured release
                const settings = entity.properties.getByPath('release.html', []);
                for (const setting of settings)
                {
                    // Render entity
                    const file = yield scope.renderEntity(entity, setting, buildConfiguration, parameters);
                    result.push(file);
                }
            }

            // Done
            return result;
        });
        return promise;
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        let resultStream = stream;
        if (!resultStream)
        {
            resultStream = through2(
                {
                    objectMode: true
                });
            const scope = this;
            co(function *()
            {
                const work = scope._cliLogger.section('Rendering template files as html');
                scope._cliLogger.options(scope.prepareParameters(buildConfiguration, parameters));
                const files = yield scope.renderEntities(buildConfiguration, parameters);
                for (const file of files)
                {
                    resultStream.write(file);
                }
                resultStream.end();
                scope._cliLogger.end(work);
            }).catch((e) =>
            {
                this.logger.error(e);
            });
        }
        return resultStream;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.RenderHtmlTask = RenderHtmlTask;
