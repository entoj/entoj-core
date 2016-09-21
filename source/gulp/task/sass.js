'use strict';

/**
 * Requirements
 * @ignore
 */
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../../model/configuration/BuildConfiguration.js').BuildConfiguration;
const SassRepository = require('../model/SassRepository.js').SassRepository;
const SitesRepository = require('../../model/site/SitesRepository.js').SitesRepository;
const Site = require('../../model/site/Site.js').Site;
const Context = require('../../application/Context.js').Context;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const BaseMap = require('../../base/BaseMap.js').BaseMap;
const ModelSynchronizer = require('../../watch/ModelSynchronizer.js').ModelSynchronizer;
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const discardComments = require('postcss-discard-comments');
const urlrewrite = require('postcss-urlrewrite');
const cli = require('../plugin/cli.js');
const synchronize = require('../../utils/synchronize.js');
const doiuse = require('doiuse');
const sass = require('node-sass');
const through2 = require('through2');
const co = require('co');
const Stream = require('stream');
const File = require('vinyl');


/**
 * Gets all compilable scss files for given site query.
 * If query is falsy or "all" then all sites will be generated.
 *
 * @param {String} query
 * @param {CliLogger} cliLogger
 */
function src(query, cliLogger)
{
    const stream = through2({ objectMode: true });
    const context = Context.instance;
    if (!cliLogger)
    {
        cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.sass' }));
    }
    co(function *()
    {
        const sitesRepository = context.di.create(SitesRepository);
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

        const sassRepository = context.di.create(SassRepository);
        for (const site of sites)
        {
            const files = yield sassRepository.getBySite(site);
            for (const file in files)
            {
                stream.write(files[file]);
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
 * Compiles a sass stream
 *
 * @param {CliLogger} cliLogger
 */
function compileSass(cliLogger)
{
    // Context & Logger
    const context = Context.instance;
    if (!cliLogger)
    {
        cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.sass' }));
    }

    // Prepare
    const pathes = context.di.create(PathesConfiguration);
    const includePathes = [pathes.sites];
    if (pathes.bower)
    {
        includePathes.push(pathes.bower);
    }

    // Render stream
    const stream = new Stream.Transform({ objectMode: true });
    let work;
    stream._transform = function (file, encoding, callback)
    {
        if (!file.isNull)
        {
            callback();
            return;
        }

        work = cliLogger.work('Compiling file <' + file.path + '>');

        // Prepare
        const compiledFile = new File({ path: file.path.replace(/\.scss/, '.css'), contents: false });
        const options =
        {
            data: file.contents.toString(),
            includePaths: includePathes,
            outputStyle: 'expanded'
        };

        // Render
        let compiled = false;
        try
        {
            compiled = sass.renderSync(options);
        }
        catch(error)
        {
            compiled = false;
            cliLogger.error('Error compiling Sass');
            cliLogger.error(error.message);
            cliLogger.error(error.file + '@' + error.line);
        }
        if (compiled)
        {
            compiledFile.contents = new Buffer(compiled.css);
            this.push(compiledFile);
            cliLogger.end(work);
        }
        else
        {
            cliLogger.end(work, true);
        }

        callback();
    };

    return stream;
}


/**
 * Compiles sass files for sites
 *
 * @param {String} query
 * @param {CliLogger} cliLogger
 */
function compile(query, streamFiles)
{
    // Context & Logger
    const context = Context.instance;
    const cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.sass' }));
    const section = cliLogger.section('Compiling sass');

    // Prepare
    const buildConfiguration = context.di.create(BuildConfiguration);
    const pathesConfiguration = context.di.create(PathesConfiguration);
    const basePath = synchronize.execute(pathesConfiguration, 'resolveCache', ['/css']);
    const browsers = buildConfiguration.get('sass.browsers', ['ie >= 9', '> 2%']);
    const sourceMaps = buildConfiguration.get('sass.sourceMaps', true);
    const comments = buildConfiguration.get('sass.comments', true);
    const optimize = buildConfiguration.get('sass.optimize', false);
    const minimize = buildConfiguration.get('sass.minimize', false);
    const check = buildConfiguration.get('sass.check', false);
    const urlRewrite = buildConfiguration.get('sass.urlRewrite', false);

    // Show config
    cliLogger.options(
        {
            environment: buildConfiguration.environment,
            query: query,
            basePath: basePath,
            sourceMaps: sourceMaps,
            comments: comments,
            urlRewrite: urlRewrite,
            optimize: optimize,
            minimize: minimize,
            check: check
        });

    // Prepare postcss
    const postcssProcessors = [];
    try
    {
        if (urlRewrite !== false)
        {
            postcssProcessors.push(urlrewrite(
                {
                    properties: ['background', 'src'],
                    rules: urlRewrite
                }));
        }
        if (comments === false)
        {
            postcssProcessors.push(discardComments());
        }
        if (check === true)
        {
            postcssProcessors.push(doiuse(
                {
                    browsers: browsers,
                    noWarnings: true,
                    onFeatureUsage: function(usageInfo)
                    {
                        cliLogger.error(usageInfo.message);
                    }
                }));
        }
        postcssProcessors.push(cssnext({ browsers: browsers }));
        if (optimize === true)
        {
            postcssProcessors.push(mqpacker());
        }
        if (minimize === true)
        {
            postcssProcessors.push(cssnano());
        }
    }
    catch(e)
    {
        cliLogger.error(e);
    }

    // Create task
    let stream = src(query, cliLogger);
    stream = stream.pipe(compileSass(cliLogger));
    if (sourceMaps === true)
    {
        stream = stream.pipe(sourcemaps.init());
    }
    stream = stream.pipe(cli.work(cliLogger, 'Postprocessing <%s>'));
    stream = stream.pipe(postcss(postcssProcessors));
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
 * Watches for changes and compiles sass files
 */
function watch()
{
    // Context & Logger
    const context = Context.instance;
    const logger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.sass' }));
    logger.section('Watching sass files');

    // Prepare
    const pathes = context.di.create(PathesConfiguration);
    const basePath = pathes.sites;
    const synchronizer = context.di.create(ModelSynchronizer);
    logger.options(
        {
            basePath: basePath
        });

    // Run
    synchronizer.signals.invalidated.add(function(synchronizer, invalidations)
    {
        if (!invalidations.extensions.length || invalidations.extensions.indexOf('.scss') > -1)
        {
            gulp.parallel(['sass.compile'])(function(error)
            {
            });
        }
    });
    synchronizer.start();
    gulp.parallel(['sass.compile'])(function(error)
    {
    });
}


/**
 * Register Tasks
 */
gulp.task('sass.compile', (cb) => compile(false, false, cb));
gulp.task('sass.watch', watch);


/**
 * Public api
 */
module.exports =
{
    compile: compile,
    compileTask: 'sass.compile',
    watch: watch,
    watchTask: 'sass.watch'
};
