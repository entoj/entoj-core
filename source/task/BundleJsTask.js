'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const FilesRepository = require('../model/file/FilesRepository.js').FilesRepository;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const SitesRepository = require('../model/site/SitesRepository.js').SitesRepository;
const ContentType = require('../model/ContentType.js');
const Site = require('../model/site/Site.js').Site;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const pathes = require('../utils/pathes.js');
const urls = require('../utils/urls.js');
const Builder = require('systemjs-builder');
const through2 = require('through2');
const VinylFile = require('vinyl');
const difference = require('lodash.difference');
const co = require('co');
const fs = require('co-fs-extra');
const templateString = require('es6-template-strings');
const PATH_SEPERATOR = require('path').sep;
const isWin32 = require('os').platform() == 'win32';


/**
 * @memberOf task
 */
class BundleJsTask extends BaseTask
{
    /**
     *
     */
    constructor(cliLogger, filesRepository, sitesRepository, pathesConfiguration)
    {
        super(cliLogger);

        //Check params
        assertParameter(this, 'filesRepository', filesRepository, true, FilesRepository);
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._filesRepository = filesRepository;
        this._sitesRepository = sitesRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._defaultGroup = 'common';
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, FilesRepository, SitesRepository, PathesConfiguration] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/BundleJsTask';
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const result = super.prepareParameters(buildConfiguration, parameters);
        result.query = result.query || '*';
        result.filenameTemplate = result.filenameTemplate || '${site.name.urlify()}/${group.urlify()}.js';
        return result;
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    generateConfiguration(buildConfiguration, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const params = scope.prepareParameters(buildConfiguration, parameters);

            // Start
            const work = scope._cliLogger.section('Generating bundle configuration for <' + params.query + '>');

            // Get Sites
            let sites = [];
            if (params.query !== '*')
            {
                const site = yield scope._sitesRepository.findBy(Site.ANY, params.query);
                sites.push(site);
            }
            else
            {
                sites = yield scope._sitesRepository.getItems();
            }

            // Get bundles
            const result = [];
            for (const site of sites)
            {
                // Get js sources
                const filter = function(file)
                {
                    return file.contentType === ContentType.JS;
                };
                const sourceFiles = yield scope._filesRepository.getBySiteGrouped(site, filter, 'groups.js', scope._defaultGroup);

                // Collect all modules
                const all = [];
                for (const group in sourceFiles)
                {
                    for (const file of sourceFiles[group])
                    {
                        const module = urls.normalizePathSeperators(file.filename.replace(scope._pathesConfiguration.sites + PATH_SEPERATOR, ''));
                        all.push(module);
                    }
                }

                // Create bundles
                const bundles = {};
                for (const group in sourceFiles)
                {
                    const filename = pathes.normalizePathSeperators(templateString(params.filenameTemplate, { site: site, group: group }));
                    const groupWork = scope._cliLogger.work('Genrating bundle config for <' + site.name + '> / <' + group + '>');
                    const bundle =
                    {
                        filename : filename,
                        prepend: [],
                        append: [],
                        include: [],
                        exclude: []
                    };

                    // Add include
                    for (const file of sourceFiles[group])
                    {
                        const module = urls.normalizePathSeperators(file.filename.replace(scope._pathesConfiguration.sites + PATH_SEPERATOR, ''));
                        bundle.include.push(module);
                    }

                    // Generate exclude
                    bundle.exclude = difference(all, bundle.include);

                    // Add jspm when default category
                    if (group === scope._defaultGroup)
                    {
                        bundle.prepend.push(pathes.concat(scope._pathesConfiguration.entoj, 'jspm_packages', 'system-polyfills.js'));
                        bundle.prepend.push(pathes.concat(scope._pathesConfiguration.entoj, 'jspm_packages', 'system.js'));
                        bundle.prepend.push(pathes.concat(scope._pathesConfiguration.entoj, 'jspm.js'));
                    }

                    // Add bundle
                    bundles[group] = bundle;
                    scope._cliLogger.end(groupWork);
                }

                result.push(bundles);
            }

            // End
            scope._cliLogger.end(work);
            return result;
        });
        return promise;
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    compileBundles(bundles, buildConfiguration, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Load config
            let builderConfig = false;
            const context =
            {
                System:
                {
                    config: (config) => builderConfig = config
                }
            };
            const builderConfigSource = yield fs.readFile(pathes.concat(scope._pathesConfiguration.entoj, 'jspm.js'), { encoding: 'utf8' });
            require('vm').runInNewContext(builderConfigSource, context);

            // Prepare config
            for (const key in builderConfig.paths)
            {
                if (builderConfig.paths[key].startsWith('jspm_packages'))
                {
                    builderConfig.paths[key] = 'entoj/' + builderConfig.paths[key];
                }
            }
            const sites = yield scope._sitesRepository.getItems();
            for (const site of sites)
            {
                builderConfig.paths[site.name.urlify() + '/*'] = 'sites/' + site.name.urlify() + '/*';
            }

            // Prepare bundler config
            const loadedFiles = [];
            const bundlerConfig =
            {
                runtime: false,
                minify: buildConfiguration.get('js.minimize', false),
                sourceMaps: false,
                lowResSourceMaps: false,
                fetch: function (load, fetch)
                {
                    const promise = co(function *()
                    {
                        const sourceFilename = pathes.normalize(load.name.replace('file:///', ''));
                        const filename = yield scope._pathesConfiguration.shorten(sourceFilename);
                        const work = scope._cliLogger.work(filename);
                        const result = yield fetch(load);
                        if (loadedFiles.indexOf(load.name) === -1)
                        {
                            const stats = fs.statSync(sourceFilename);
                            const size = stats['size'] / 1024;
                            scope._cliLogger.end(work, false, 'Added ' + filename + ' <' + size.toFixed(1) + 'kb>');
                            loadedFiles.push(load.name);
                        }

                        return result;
                    });
                    return promise;
                }
            };

            // Build bundles
            const builder = new Builder((isWin32 ? 'file:///' : '') + scope._pathesConfiguration.root, builderConfig);
            const result = [];
            for (const name in bundles)
            {
                const section = scope._cliLogger.section('Creating bundle <' + bundles[name].filename + '>');

                // Get bundle arithmetic
                const bundle = bundles[name];
                let modules = bundle.include.join(' + ');
                // Remove excludes when not default group
                if (name !== scope._defaultGroup && bundle.exclude.length)
                {
                    modules+= ' - ' + bundle.exclude.join(' - ');
                }

                // Build bundle
                const bundled = yield builder.bundle(modules, bundlerConfig);

                // Create file
                let contents = '';

                // Prepend files
                for (const filename of bundle.prepend)
                {
                    const work = scope._cliLogger.work(filename);
                    const fileContent = yield fs.readFile(filename, { encoding: 'utf8' });
                    contents+= fileContent;
                    scope._cliLogger.end(work, false, 'Prepended ' + filename);
                }

                // Bundle
                contents+= bundled.source;
                const file = new VinylFile(
                    {
                        path: bundle.filename,
                        contents: new Buffer(contents)
                    });
                result.push(file);

                // Done
                scope._cliLogger.end(section);
            }

            return result;
        })
        .catch((e) => this.logger.error(e) );
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
                const siteBundles = yield scope.generateConfiguration(buildConfiguration, parameters);
                const work = scope._cliLogger.section('Bundling js files');
                scope._cliLogger.options(scope.prepareParameters(buildConfiguration, parameters));
                for (const siteBundle of siteBundles)
                {
                    const siteFiles = yield scope.compileBundles(siteBundle, buildConfiguration, parameters);
                    for (const siteFile of siteFiles)
                    {
                        resultStream.write(siteFile);
                    }
                }
                resultStream.end();
                scope._cliLogger.end(work);
            });
        }
        return resultStream;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BundleJsTask = BundleJsTask;
