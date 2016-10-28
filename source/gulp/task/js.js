'use strict';

/**
 * Requirements
 * @ignore
 */
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../../model/configuration/BuildConfiguration.js').BuildConfiguration;
const SitesRepository = require('../../model/site/SitesRepository.js').SitesRepository;
const Site = require('../../model/site/Site.js').Site;
const IdParser = require('../../parser/entity/IdParser.js').IdParser;
const JsRepository = require('../model/JsRepository.js').JsRepository;
const Context = require('../../application/Context.js').Context;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const BaseMap = require('../../base/BaseMap.js').BaseMap;
const EnvironmentActivator = require('../../source/EnvironmentActivator.js').EnvironmentActivator;
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const cli = require('../plugin/cli.js');
const synchronize = require('../../utils/synchronize.js');
const Builder = require('systemjs-builder');
const co = require('co');
const fs = require('co-fs-extra');
const fs_ = require('fs');
const VinylFile = require('vinyl');
const through2 = require('through2');
const filesize = require('filesize');
const Stream = require('stream');


/**
 * Gets all js bundles for the given site query.
 * If query is falsy or "all" then all sites will be generated.
 *
 * @param {String} query
 * @param {CliLogger} cliLogger
 */
function src(query, cliLogger)
{
    // Context & Logger
    const stream = through2({ objectMode: true });
    const context = Context.instance;
    if (!cliLogger)
    {
        cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.sass' }));
    }

    // Bundle files
    co(function*()
    {
        const pathesConfiguration = context.di.create(PathesConfiguration);
        const jsRepository = context.di.create(JsRepository);
        const sitesRepository = context.di.create(SitesRepository);
        const idParser = context.di.create(IdParser);
        let sites = [];
        if (typeof query == 'string' && query !== '*')
        {
            const site = yield sitesRepository.findBy(Site.ANY, query);
            sites.push(site);
        }
        else
        {
            sites = yield sitesRepository.getItems();
        }

        // Iterate over sites
        for (const site of sites)
        {
            const bundles = yield jsRepository.getBundlesBySite(site);
            const bundleContents = [];
            const entityMapping = {};
            let isFirst = true;

            // Build bundles
            for (const name in bundles)
            {
                const section = cliLogger.section('Creating bundle <' + bundles[name].filename + '>');

                // Get bundle arithmetic
                const bundle = bundles[name];
                let modules = bundle.include.join(' + ');
                if (!isFirst)
                {
                    if (bundle.exclude.length)
                    {
                        modules+= ' - ' + bundle.exclude.join(' - ');
                    }
                }

                // Create options
                const options =
                {
                    runtime: false,
                    minify: false,
                    sourceMaps: false,
                    lowResSourceMaps: false
                };

                // Configure bundler
                const builder = new Builder(pathesConfiguration.entoj, pathesConfiguration.entoj + '/jspm.js');
                builder.config(
                    {
                        babelOptions:
                        {
                            'optional':
                            [
                                'runtime'
                            ]
                        },
                        paths:
                        {
                            'jspm_packages/*': './entoj/jspm_packages/*',
                            'base/*': './sites/base/*',
                            'beneful/*': './sites/beneful/*'
                        }
                    });

                // Build bundle
                const bundled = yield builder.bundle(modules, options);

                // Add entity mapping
                for (const module of bundled.modules)
                {
                    if (module.indexOf(':') === -1)
                    {
                        const work = cliLogger.work(module);
                        const id = yield idParser.parse(module);
                        if (id.site.isEqualTo(site))
                        {
                            entityMapping[id.entityId.idString] =
                            {
                                module: module,
                                bundle: '/' + bundle.filename
                            };
                            cliLogger.end(work, false, 'Added mapping for <' + module + '>');
                        }
                        else
                        {
                            cliLogger.end(work, false, 'Added <' + module + '>');
                        }
                    }
                }

                // Create file
                let contents = '';

                // Prepend files
                for (const filename of bundle.prepend)
                {
                    const work = cliLogger.work(filename);
                    const stat = fs_.statSync(filename);
                    const fileContent = yield fs.readFile(filename, { encoding: 'utf8' });
                    contents+= fileContent;
                    cliLogger.end(work, false, 'Prepended ' + filename + ' (' + filesize(stat.size) + ')');
                }

                // Bundle
                contents+= bundled.source;
                bundleContents.push(
                    {
                        isFirst: isFirst === true,
                        bundle: bundle,
                        contents: contents
                    });

                // Done
                isFirst = false;
                cliLogger.end(section);
            }

            // Add loader config
            const loaderConfiguration = '';
            //let loaderConfiguration = '\nSystem.import(\'global/loader\').then(function(module) { module.configure(\'base\', ' + JSON.stringify(entityMapping) + ') });';

            // Add to stream
            for (const bundleContent of bundleContents)
            {
                const file = new VinylFile(
                    {
                        path: bundleContent.bundle.filename,
                        contents: new Buffer(bundleContent.contents + (bundleContent.isFirst ? loaderConfiguration : ''))
                    });
                stream.write(file);
            }
        }

        return true;
    })
    .catch(function(e)
    {
        cliLogger.error(e);
        stream.end();
    })
    .then(function()
    {
        stream.end();
    });

    return stream;
}


/**
 * @param {CliLogger} cliLogger
 */
function preprocess(cliLogger)
{
    // Context & Logger
    const context = Context.instance;
    if (!cliLogger)
    {
        cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.sass' }));
    }

    // Prepare
    const buildConfiguration = context.di.create(BuildConfiguration);
    const environmentActivator = context.di.create(EnvironmentActivator);

    // Render stream
    const stream = new Stream.Transform({ objectMode: true });
    stream._transform = function (file, encoding, callback)
    {
        if (!file.path)
        {
            callback();
            return;
        }
        const work = cliLogger.work('Preprocess <' + file.path + '>');
        const source = file.contents.toString();
        environmentActivator.activate(source, buildConfiguration.environment)
            .then(function(preprocessedSource)
            {
                const preprocessedFile = new VinylFile(
                    {
                        path: file.path,
                        contents: new Buffer(preprocessedSource)
                    });
                stream.push(preprocessedFile);
                cliLogger.end(work);
                callback();
            });
    };

    return stream;
}


/**
 *
 */
function compile(query, streamFiles)
{
    // Context & Logger
    const context = Context.instance;
    const cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.js' }));
    const section = cliLogger.section('Compiling js');

    // Check bundling
    const buildConfiguration = context.di.create(BuildConfiguration);
    const bundle = buildConfiguration.get('js.bundle', false);
    if (!bundle)
    {
        cliLogger.error('Enable bundling in your build configuration.');
        cliLogger.end(section);
        const empty = through2.obj();
        process.nextTick(empty.end.bind(empty));
        return empty;
    }

    // Prepare
    const pathesConfiguration = context.di.create(PathesConfiguration);
    const basePath = synchronize.execute(pathesConfiguration, 'resolveCache', ['/js']);
    const sourceMaps = buildConfiguration.get('js.sourceMaps', false);
    const minimize = buildConfiguration.get('js.minimize', false);

    // Show config
    cliLogger.options(
        {
            environment: buildConfiguration.environment,
            query: query,
            basePath: basePath,
            sourceMaps: sourceMaps,
            minimize: minimize,
        });

    // Create task
    let stream = src(query, cliLogger);
    stream = stream.pipe(preprocess(cliLogger));
    stream = stream.pipe(cli.work(cliLogger, 'Postprocess <%s>'));
    if (sourceMaps === true)
    {
        stream = stream.pipe(sourcemaps.init());
    }
    if (sourceMaps === true || minimize === true)
    {
        stream = stream.pipe(uglify(
            {
                mangle: minimize,
                compress: minimize,
                outSourceMap: 'js.map'
            }));
    }
    if (sourceMaps === true)
    {
        stream = stream.pipe(sourcemaps.write());
    }
    stream = stream.pipe(cli.end(cliLogger));
    if (!streamFiles)
    {
        stream = stream.pipe(gulp.dest(basePath));
    }

    // Listen for end
    stream.on('end', function()
    {
        cliLogger.end(section);
    });

    return stream;
}


/**
 * Register Tasks
 */
gulp.task('js.compile', (cb) => compile(false, false, cb));


/**
 * Public api
 */
module.exports =
{
    compile: compile,
    compileTask: 'js.compile'
};
