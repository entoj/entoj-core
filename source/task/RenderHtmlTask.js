'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const Environment = require('../nunjucks/Environment.js').Environment;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const pathes = require('../utils/pathes.js');
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
    constructor(cliLogger, globalRepository, pathesConfiguration, nunjucks)
    {
        super(cliLogger);

        //Check params
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'nunjucks', nunjucks, true, Environment);

        // Assign options
        this._globalRepository = globalRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._nunjucks = nunjucks;

        // Configure nunjucks path
        this._nunjucks.path = this._pathesConfiguration.sites;
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, GlobalRepository, PathesConfiguration, Environment] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/RenderHtmlTask';
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
            let template = '{{ ' + macroName + '(';
            const renderedParameters = [];
            for (const key in macroParameters)
            {
                let value = macroParameters[key];
                source+= key + '=';
                if (typeof value == 'string')
                {
                    value = '\'' + value + '\'';
                }
                renderedParameters.push(key + '=' + value);
            }
            template+= renderedParameters.join(', ') + ') }}';

            // Compile
            const work = scope._cliLogger.work('Rendering template to html for <' + entity.idString + '> as <' + filename + '>');
            const data = { site: entity.site };
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
}


/**
 * Exports
 * @ignore
 */
module.exports.RenderHtmlTask = RenderHtmlTask;
