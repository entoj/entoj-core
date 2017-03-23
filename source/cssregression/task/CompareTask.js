'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('../../task/BaseTask.js').BaseTask;
const GlobalRepository = require('../../model/GlobalRepository.js').GlobalRepository;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const SitesRepository = require('../../model/site/SitesRepository.js').SitesRepository;
const Site = require('../../model/site/Site.js').Site;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const Screenshot = require('../utils/Screenshot.js').Screenshot;
const assertParameter = require('../../utils/assert.js').assertParameter;
const pathes = require('../../utils/pathes.js');
const urls = require('../../utils/urls.js');
const through2 = require('through2');
const VinylFile = require('vinyl');
const path = require('path');
const co = require('co');
const fs = require('co-fs-extra');
const templateString = require('es6-template-strings');
const BlinkDiff = require('blink-diff');
const PNGImage = require('pngjs-image');
const chalk = require('chalk');



/**
 * @memberOf task
 */
class CompareTask extends BaseTask
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
        return { 'parameters': [CliLogger, SitesRepository,
            GlobalRepository, PathesConfiguration] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'cssregression/CompareTask';
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
        result.compareReferenceSuffix = result.compareReferenceSuffix || 'reference';
        result.compareTestSuffix = result.compareTestSuffix || 'test';
        result.compareDiffSuffix = result.compareDiffSuffix || 'diff';

        return result;
    }


    /**
     * Compares two images
     *
     * @param  {String} referenceFile
     * @param  {String} testFile
     * @return {Promise}
     */
    compareImages(referenceFile, testFile, diffFile)
    {
        return new Promise(function(resolve, reject)
        {
            const diff = new BlinkDiff(
            {
                imageAPath: referenceFile,
                imageBPath: testFile,
                imageOutputPath: diffFile,
                delta: 50,
                outputMaskRed: 0,
                outputMaskBlue: 255,
                hideShift: true,
                composition: false
            });

            diff.run(function (error, result)
            {
                if (error)
                {
                  reject(error);
                }
                else
                {
                    result.passed = diff.hasPassed(result.code);
                    resolve(result);
                }
            });
        });
    }


    /**
     * @returns {Promise<Array>}
     */
    compareEntity(entity, entitySettings, buildConfiguration, parameters)
    {
        if (!entity)
        {
            this.logger.warn(this.className + '::compareEntity - No entity given');
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const settings = entitySettings || {};
            const result =
            {
                total: 0,
                ok: 0,
                failed: 0,
                name: settings.name || urls.urlify(path.basename(settings.url, '.j2')),
                screens: []
            };
            const widths = [320, 768, 1024, 1280];
            const filepath = pathes.concat(scope._pathesConfiguration.sites,
                templateString(parameters.filepathTemplate,
                {
                    entity: entity,
                    entityId: entity.id,
                    site: entity.id.site,
                    entityCategory: entity.id.category
                }));

            // Compare viewports
            for (const width of widths)
            {
                const filename = '-' + result.name + '@' + width + '.png';
                const compare =
                {
                    ok: false,
                    width: width,
                    referenceFile: pathes.concat(filepath, parameters.compareReferenceSuffix + filename),
                    referenceUrl: '',
                    testFile: pathes.concat(filepath, parameters.compareTestSuffix + filename),
                    testUrl: '',
                    diffFile: pathes.concat(filepath, parameters.compareDiffSuffix + filename),
                    diffFUrl: ''
                };
                compare.referenceUrl = urls.normalizePathSeperators(compare.referenceFile.replace(scope._pathesConfiguration.sites, ''));
                compare.testUrl = urls.normalizePathSeperators(compare.testFile.replace(scope._pathesConfiguration.sites, ''));
                compare.diffFUrl = urls.normalizePathSeperators(compare.diffFile.replace(scope._pathesConfiguration.sites, ''));
                const work = scope._cliLogger.work('Comparing image of <' + entity.pathString + '> for viewport <' + width + '>');
                const diff = yield scope.compareImages(compare.referenceFile, compare.testFile, compare.diffFile);
                result.total++;
                if (diff.passed)
                {
                    compare.ok = true;
                    result.ok++;
                }
                else
                {
                    result.failed++;
                }
                result.screens.push(compare);
                scope._cliLogger.end(work, !diff.passed);
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
     * @inheritDocs
     * @returns {Promise<Array>}
     */
    compareEntities(buildConfiguration, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const params = scope.prepareParameters(buildConfiguration, parameters);
            const stats = { ok: 0, failed: 0 };

            // Compare each entity
            const entities = yield scope._globalRepository.resolveEntities(params.query);
            for (const entity of entities)
            {
                // Run each configured regression test
                const result = { total: 0, ok: 0, failed: 0, tests: [] };
                const settings = entity.properties.getByPath('testing.cssregression', []);
                for (const setting of settings)
                {
                    const testResult = yield scope.compareEntity(entity, setting, buildConfiguration, parameters);
                    result.total+= testResult.total;
                    result.ok+= testResult.ok;
                    stats.ok+= testResult.ok;
                    result.failed+= testResult.failed;
                    stats.failed+= testResult.failed;
                    result.tests.push(testResult);
                }

                // Write state
                if (result.total > 0)
                {
                    const filename = yield scope._pathesConfiguration.resolveEntity(entity, '/tests/cssregression.json');
                    yield fs.writeFile(filename,
                        JSON.stringify(result, null, 4),
                        { encoding: 'utf8'});
                }
            }

            // Show results
            scope._cliLogger.info('');
            scope._cliLogger.info('Test results');
            scope._cliLogger.info('  Ok       : ' + chalk.bold(chalk.green(stats.ok)) + '');
            scope._cliLogger.info('  Failures : ' + chalk.bold(chalk.red(stats.failed)) + '');

            // Done
            return true;
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
                const work = scope._cliLogger.section('Comparing screenshots');
                scope._cliLogger.options(scope.prepareParameters(buildConfiguration, parameters));
                yield scope.compareEntities(buildConfiguration, parameters);
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
module.exports.CompareTask = CompareTask;
