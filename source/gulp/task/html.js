'use strict';

/**
 * Requirements
 * @ignore
 */
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const UrlsConfiguration = require('../../model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const BuildConfiguration = require('../../model/configuration/BuildConfiguration.js').BuildConfiguration;
const GlobalRepository = require('../../model/GlobalRepository.js').GlobalRepository;
const DocumentationCallable = require('../../model/documentation/DocumentationCallable.js').DocumentationCallable;
const ContentType = require('../../model/ContentType.js');
const HtmlFormatter = require('../../formatter/html/HtmlFormatter.js').HtmlFormatter;
const Environment = require('../../nunjucks/Environment.js').Environment;
const Context = require('../../application/Context.js').Context;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const BaseMap = require('../../base/BaseMap.js').BaseMap;
const gulp = require('gulp');
const synchronize = require('../../utils/synchronize.js');
const through2 = require('through2');
const co = require('co');
const trimLeadingSlash = require('../../utils/pathes.js').trimLeadingSlash;
const VinylFile = require('vinyl');


/**
 * Compiles html from entities matched by query.
 */
function compileHtml(query, cliLogger)
{
    // Context & Logger
    const context = Context.instance;
    if (!cliLogger)
    {
        cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.html' }));
    }

    // Render files
    let work;
    const stream = through2({ objectMode: true });
    co(function*()
    {
        const pathesConfiguration = context.di.create(PathesConfiguration);
        const urlsConfiguration = context.di.create(UrlsConfiguration);
        const globalRepository = context.di.create(GlobalRepository);
        const htmlFormatter = context.di.create(HtmlFormatter);
        const nunjucks = context.di.create(Environment, new BaseMap(
            {
                'nunjucks/Environment.options' : { rootPath: pathesConfiguration.sites }
            }));
        const entitiesQuery = query || '*';

        // Export each entity
        const entities = yield globalRepository.resolveEntities(entitiesQuery);
        for (const entity of entities)
        {
            // Render each export
            const settings = entity.properties.getByPath('build.html', []);
            for (const setting of settings)
            {
                // Get settings
                const macro = setting.macro || entity.idString.lodasherize();
                const entityPath = entity.pathString + '/' + entity.idString;
                let filename;
                if (setting.filename)
                {
                    filename = setting.filename;

                    // Add entity path if necessary
                    if (filename.indexOf('/') == '-1')
                    {
                        filename = trimLeadingSlash(entity.pathString + '/' + filename);
                    }

                    // Add .html if necessary
                    if (!filename.endsWith('.html'))
                    {
                        filename+= '.html';
                    }
                }
                else
                {
                    filename = trimLeadingSlash(entityPath + '.html');
                }
                const parameters = setting.parameters || {};
                work = cliLogger.work('Exporting <' + entity.idString + '> as <' + filename + '>');

                // Prepare source
                let source = '';
                switch (setting.type)
                {
                    case 'extend':
                        const template = yield urlsConfiguration.matchEntityFile(entityPath + '.j2');
                        if (template && template.file)
                        {
                            const templatePath = template.file.filename.replace(pathesConfiguration.sites, '');
                            source+= '{% extends "' + templatePath + '" %}\n';
                        }
                        break;

                    case 'include':
                        const include = yield urlsConfiguration.matchEntityFile(entityPath + '.j2');
                        if (include && include.file)
                        {
                            const includePath = include.file.filename.replace(pathesConfiguration.sites, '');
                            source+= '{% include "' + includePath + '" %}\n';
                        }
                        break;

                    default:
                        let macroPath = '';
                        const macros = entity.documentation.filter(doc => doc.contentType == ContentType.JINJA && doc instanceof DocumentationCallable);
                        for (const m of macros)
                        {
                            if (m.name === macro)
                            {
                                macroPath = m.file.filename.replace(pathesConfiguration.sites, '');
                            }
                        }
                        source+= '{% include "' + macroPath + '" %}\n';
                        source+= '{{ ' + macro + '(';
                        let isFirst = true;
                        for (const key in parameters)
                        {
                            const value = parameters[key];
                            if (!isFirst)
                            {
                                source+= ', ';
                            }
                            source+= key + '=';
                            if (typeof value == 'string')
                            {
                                source+= '\'' + value + '\'';
                            }
                            else
                            {
                                source+= value;
                            }
                            isFirst = false;
                        }
                        source+=') }}';
                }

                // Render
                const data = { site: entity.site };
                const contents = yield htmlFormatter.format(nunjucks.renderString(source, data));

                // Add to stream
                const file = new VinylFile(
                    {
                        path: filename,
                        contents: new Buffer(contents)
                    });
                stream.write(file);

                cliLogger.end(work);
            }
        }
        return true;
    })
    .catch(function(e)
    {
        cliLogger.error(e);
        cliLogger.end(work, true);
        stream.end();
    })
    .then(function()
    {
        stream.end();
    });

    return stream;
}


/**
 * Compiles sass files for sites
 */
function compile(query, streamFiles)
{
    // Context & Logger
    const context = Context.instance;
    const cliLogger = context.di.create(CliLogger, new BaseMap({ 'cli/CliLogger.prefix' : 'gulp.html' }));
    const section = cliLogger.section('Compiling html');

    // Prepare
    const buildConfiguration = context.di.create(BuildConfiguration);
    const pathesConfiguration = context.di.create(PathesConfiguration);
    const basePath = synchronize.execute(pathesConfiguration, 'resolveCache', ['/html']);

    // Show config
    cliLogger.options(
        {
            environment: buildConfiguration.environment,
            query: query,
            streamFiles: streamFiles || false,
            basePath: basePath
        });

    // Create task
    let stream = compileHtml(query, cliLogger);
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
gulp.task('html.compile', (cb) => compile(false, false, cb));


/**
 * Public api
 */
module.exports =
{
    compile: compile,
    compileTask: 'html.compile'
};
