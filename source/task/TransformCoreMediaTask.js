'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const CoreMediaTransformer = require('../transformer/CoreMediaTransformer.js').CoreMediaTransformer;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const ContentType = require('../model/ContentType.js');
const assertParameter = require('../utils/assert.js').assertParameter;
const pathes = require('../utils/pathes.js');
const merge = require('../utils/objects.js').merge;
const templateString = require('es6-template-strings');
const through2 = require('through2');
const VinylFile = require('vinyl');
const co = require('co');
const PATH_SEPERATOR = require('path').sep;


/**
 * Parameters:
 *     query - Restricts the source entities to the given query (see GlobalRepository.resolve)
 *     flatten - writes files in a flat structure like siteName/filename
 *
 * Properties:
 *     release.coremedia
 *         filename
 *         macro
 *
 * @memberOf task
 */
class TransformCoreMediaTask extends BaseTask
{
    /**
     *
     */
    constructor(cliLogger, globalRepository, transformer)
    {
        super(cliLogger);

        //Check params
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'transformer', transformer, true, CoreMediaTransformer);

        // Assign options
        this._globalRepository = globalRepository;
        this._transformer = transformer;
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, GlobalRepository, CoreMediaTransformer] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/TransformCoreMediaTask';
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
    transformEntity(entity, entitySettings, buildConfiguration, parameters)
    {
        if (!entity)
        {
            this.logger.warn(this.className + '::transformEntity - No entity given');
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const settings = entitySettings || {};
            const params = scope.prepareParameters(buildConfiguration, parameters);
            const macroName = settings.macro || entity.idString.lodasherize();
            const macroParams = params.macros ? params.macros[macroName] || false : false;
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

                // Add .jsp if necessary
                if (!filename.endsWith('.jsp'))
                {
                    filename+= '.jsp';
                }
            }
            else if (macroParams || (settings.type && settings.view))
            {
                filename = pathes.trimLeadingSlash(filepath + PATH_SEPERATOR + (settings.type || macroParams.type) + '.' + (settings.view || macroParams.view) + '.jsp');
            }
            else
            {
                filename = pathes.trimLeadingSlash(filepath + PATH_SEPERATOR + entity.idString + '.jsp');
            }

            // Compile
            const work = scope._cliLogger.work('Compiling CoreMedia template for <' + entity.idString + '> as <' + filename + '>');
            const transformerOptions = merge(params, settings);
            const contents = yield scope._transformer.transformMacro(entity.id.site, macroName, transformerOptions);
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
    prepareEntities(buildConfiguration, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const params = scope.prepareParameters(buildConfiguration, parameters);

            // Check each entity
            const result =
            {
                macros: {},
                views: {}
            };
            const entities = yield scope._globalRepository.resolveEntities(params.query);
            for (const entity of entities)
            {
                // Find each configured release
                const settings = entity.properties.getByPath('release.coremedia', []);
                for (const setting of settings)
                {
                    // Get macro
                    const macroName = setting.macro || entity.idString.lodasherize();
                    const macro = entity.documentation.find((doc) =>
                    {
                        return doc.contentType === ContentType.JINJA &&
                               doc.name === macroName;
                    });

                    // Prepare macro settings
                    if (macro)
                    {
                        // Set defaults
                        result.macros[macroName] =
                        {
                            type: setting.type || 'CMObject',
                            view: setting.view || macroName.replace(/\s|_/g, '-')
                        };

                        // Get type from docs when not set via settings
                        if (!setting.type)
                        {
                            const modelParameter = macro.parameters.find((param) =>
                            {
                                return param.name === 'model';
                            });
                            if (modelParameter && modelParameter.type[0] != '*')
                            {
                                result.macros[macroName].type = modelParameter.type[0];
                            }
                        }

                        // Add view for macro
                        result.views[macroName] = result.macros[macroName].view;
                    }
                }
            }

            // Done
            return result;
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Array>}
     */
    transformEntities(buildConfiguration, parameters)
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
                const settings = entity.properties.getByPath('release.coremedia', []);
                for (const setting of settings)
                {
                    // Compile entity
                    const file = yield scope.transformEntity(entity, setting, buildConfiguration, parameters);
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
                const work = scope._cliLogger.section('Transforming template files');
                const params = scope.prepareParameters(buildConfiguration, parameters);
                scope._cliLogger.options(params);
                const settings = yield scope.prepareEntities(buildConfiguration, parameters);
                const entityParameters = merge(params, settings);
                const files = yield scope.transformEntities(buildConfiguration, entityParameters);
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
module.exports.TransformCoreMediaTask = TransformCoreMediaTask;
