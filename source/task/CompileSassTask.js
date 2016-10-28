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
const through2 = require('through2');
const VinylFile = require('vinyl');
const co = require('co');
const sass = require('node-sass');
const templateString = require('es6-template-strings');



/**
 * @memberOf task
 */
class CompileSassTask extends BaseTask
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
        return 'task/CompileSassTask';
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const result = super.prepareParameters(buildConfiguration, parameters);
        result.query = result.query || '*';
        result.filenameTemplate = result.filenameTemplate || '${site.name.urlify()}/css/${group}.scss';
        return result;
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    generateFiles(buildConfiguration, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const params = scope.prepareParameters(buildConfiguration, parameters);

            // Start
            const work = scope._cliLogger.section('Generating sass files for <' + params.query + '>');

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
            scope.logger.debug('Generating files for sites : ' + (sites.reduce((current, next) => current+= next.name + ' ', '')));

            // Get files
            const files = [];
            for (const site of sites)
            {
                // Get sass sources
                const filter = function(file)
                {
                    return file.contentType === ContentType.SASS && !file.basename.startsWith('_');
                };
                const sourceFiles = yield scope._filesRepository.getBySiteGrouped(site, filter, 'groups.css', 'common');

                // Create sass files
                for (const group in sourceFiles)
                {
                    const filename = templateString(params.filenameTemplate, { site: site, group: group });
                    const workGroup = scope._cliLogger.work('Generating <' + filename + '> for site <' + site.name + '> and group <' + group + '>');

                    let content = '';
                    for (const file of sourceFiles[group])
                    {
                        let includePath = pathes.normalize(file.filename);
                        includePath = includePath.replace(pathes.normalize(scope._pathesConfiguration.sites), '');
                        includePath = urls.normalizePathSeperators(pathes.trimLeadingSlash(includePath));
                        content+= `@import '${includePath}';\n`;
                    }
                    const vinylFile = new VinylFile(
                        {
                            path: filename,
                            contents: new Buffer(content)
                        });
                    files.push(vinylFile);

                    scope._cliLogger.end(workGroup);
                }
            }

            // End
            scope._cliLogger.end(work);
            return files;
        });
        return promise;
    }


    /**
     * Compiles a sass file
     *
     * @protected
     * @return {Promise<VinylFile>}
     */
    compileFile(file, buildConfiguration, parameters)
    {
        if (!file || !file.isNull)
        {
            return Promise.resolve('');
        }

        const work = this._cliLogger.work('Compiling file <' + file.path + '>');

        // Prepare
        const includePathes = [this._pathesConfiguration.sites];
        if (this._pathesConfiguration.bower)
        {
            includePathes.push(this._pathesConfiguration.bower);
        }
        const compiledFile = new VinylFile(
            {
                path: file.path ? file.path.replace(/\.scss/, '.css') : '',
                contents: false
            });
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
            if (options.data != '')
            {
                compiled = sass.renderSync(options);
            }
            else
            {
                compiled = { css: '' };
            }
        }
        catch(error)
        {
            compiled = false;
            this._cliLogger.error('Error compiling Sass');
            this._cliLogger.error(error.message);
            this._cliLogger.error(error.file + '@' + error.line);
        }

        // Error?
        if (compiled === false)
        {
            this._cliLogger.end(work, true);
            throw new Error(this.className + '::compileFile - could not compile file ' + file.path);
        }

        // Done
        compiledFile.contents = new Buffer(compiled.css);
        this._cliLogger.end(work);
        return Promise.resolve(compiledFile);
    }


    /**
     * @protected
     * @returns {Stream}
     */
    compileFiles(buildConfiguration, parameters)
    {
        const stream = through2(
            {
                objectMode: true
            });
        const scope = this;
        co(function *()
        {
            const sourceFiles = yield scope.generateFiles(buildConfiguration, parameters);
            const work = scope._cliLogger.section('Compiling sass files');
            scope._cliLogger.options(scope.prepareParameters(buildConfiguration, parameters));
            for (const sourceFile of sourceFiles)
            {
                const compiledFile = yield scope.compileFile(sourceFile, buildConfiguration, parameters);
                stream.write(compiledFile);
            }
            stream.end();
            scope._cliLogger.end(work);
        });
        return stream;
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        let resultStream = stream;
        if (!resultStream)
        {
            resultStream = this.compileFiles(buildConfiguration, parameters);
        }
        return resultStream;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CompileSassTask = CompileSassTask;
