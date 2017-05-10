'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('../../task/BaseTask.js').BaseTask;
const GlobalRepository = require('../../model/GlobalRepository.js').GlobalRepository;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const SitesRepository = require('../../model/site/SitesRepository.js').SitesRepository;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const Screenshot = require('../utils/Screenshot.js').Screenshot;
const assertParameter = require('../../utils/assert.js').assertParameter;
const pathes = require('../../utils/pathes.js');
const urls = require('../../utils/urls.js');
const through2 = require('through2');
const VinylFile = require('vinyl');
const co = require('co');
const templateString = require('es6-template-strings');
const path = require('path');


/**
 * @memberOf task
 */
class ScreenshotTask extends BaseTask
{
    /**
     *
     */
    constructor(cliLogger, sitesRepository, globalRepository, pathesConfiguration)
    {
        super(cliLogger);

        //Check params
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._sitesRepository = sitesRepository;
        this._globalRepository = globalRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._screenshot = new Screenshot();
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, SitesRepository, GlobalRepository, PathesConfiguration] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'cssregression/CreateReferencesTask';
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const result = super.prepareParameters(buildConfiguration, parameters);
        result.query = result.query || '*';
        result.filepathTemplate = result.filepathTemplate || '${site.name.urlify()}/${entityCategory.pluralName.urlify()}/${entity.idString}/tests/cssregression';
        result.screenshotSuffix = result.screenshotSuffix || 'screenshot';
        return result;
    }


    /**
     * @returns {Promise<Array>}
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
            const files = [];
            const settings = entitySettings || {};
            const widths = [320, 768, 1024, 1280];
            const basepath = pathes.normalizePathSeperators(templateString(parameters.filepathTemplate,
                {
                    entity: entity,
                    entityId: entity.id,
                    site: entity.id.site,
                    entityCategory: entity.id.category
                }));
            const testName = settings.name || urls.urlify(path.basename(settings.url, '.j2'));
            const url = 'https://localhost:3000' + entity.pathString + '/' + settings.url + '?static';

            // Render viewports
            for (const width of widths)
            {
                const filename = parameters.screenshotSuffix + '-' + testName + '@' + width + '.png'
                const filepath = pathes.normalizePathSeperators(basepath + '/' + filename);
                const work = scope._cliLogger.work('Rendering <' + entity.pathString + '/' + settings.url + '> for viewport <' + width + '> as <' + filename + '>');
                const screenshot = yield scope._screenshot.create(url, width);
                const file = new VinylFile(
                    {
                        path: filepath,
                        contents: screenshot
                    });
                files.push(file);
                scope._cliLogger.end(work);
            }

            // Done
            return files;
        })
        .catch((e) =>
        {
            this.logger.error(e);
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
                // Render each configured regression test
                const settings = entity.properties.getByPath('testing.cssregression', []);
                for (const setting of settings)
                {
                    // Render entity
                    const files = yield scope.renderEntity(entity, setting, buildConfiguration, parameters);
                    for (const file of files)
                    {
                        result.push(file);
                    }
                }
            }

            // Done
            return result;
        })
        .catch((e) =>
        {
            this.logger.error(e);
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
                const work = scope._cliLogger.section('Rendering screenshots');
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
module.exports.ScreenshotTask = ScreenshotTask;
