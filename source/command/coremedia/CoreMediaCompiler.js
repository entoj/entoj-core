'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const GlobalRepository = require('../../model/GlobalRepository.js').GlobalRepository;
const Transformer = require('../../transformer/Transformer.js').Transformer;
const trimLeadingSlash = require('../../utils/pathes.js').trimLeadingSlash;
const assertParameter = require('../../utils/assert.js').assertParameter;
const prettyDiff = require("gulp-prettydiff");
const co = require('co');
const through2 = require('through2');
const VinylFile = require('vinyl');
const gulp = require('gulp');


/**
 * @memberOf command.coremedia
 */
class CoreMediaCompiler extends Base
{
    /**
     *
     */
    constructor(cliLogger, globalRepository, transformer)
    {
        super();

        //Check params
        assertParameter(this, 'cliLogger', cliLogger, true, CliLogger);
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'transformer', transformer, true, Transformer);


        // Assign options
        this._cliLogger = cliLogger;
        this._globalRepository = globalRepository;
        this._transformer = transformer;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, GlobalRepository, Transformer] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command.coremedia/CoreMediaCompiler';
    }


    /**
     * @inheritDocs
     * @returns {Promise<Stream>}
     */
    waitForEnd(stream)
    {
        const promise = new Promise((resolve) =>
        {
            stream.on('end', function()
            {
                resolve(stream);
            });
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<VinylFile>}
     */
    compileEntity(entity, settings)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const macroName = settings.macro || entity.idString.lodasherize();
            const entityPath = entity.pathString + '/' + entity.idString;
            let filename;
            if (settings.filename)
            {
                filename = settings.filename;

                // Add entity path if necessary
                if (filename.indexOf('/') == '-1')
                {
                    filename = trimLeadingSlash(entity.pathString + '/' + filename);
                }

                // Add .jsp if necessary
                if (!filename.endsWith('.jsp'))
                {
                    filename+= '.jsp';
                }
            }
            else
            {
                filename = trimLeadingSlash(entityPath + '.jsp');
            }

            // Compile
            const work = scope._cliLogger.work('Compiling CoreMedia template for <' + entity.idString + '> as <' + filename + '>');
            const contents = yield scope._transformer.transformMacro(entity.id.site, macroName);
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
     * @returns {Promise<Stream>}
     */
    compileEntities(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const params = parameters || {};
            const stream = through2({ objectMode: true });
            const entitiesQuery = params.query || '*';
            const work = scope._cliLogger.work('Compiling CoreMedia templates for query <' + entitiesQuery + '>');

            // Compile each entity
            const entities = yield scope._globalRepository.resolveEntities(entitiesQuery);
            for (const entity of entities)
            {
                // Render each configured release
                const settings = entity.properties.getByPath('release.coremedia', []);
                for (const setting of settings)
                {
                    const file = yield scope.compileEntity(entity, setting);
                    stream.write(file);
                }
            }

            // Close stream
            stream.end();
            scope._cliLogger.end(work);

            return stream;
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Stream>}
     */
    beautifyFiles(stream)
    {
        const work = this._cliLogger.work('Beautify CoreMedia templates');
        const options =
        {
            lang: 'html',
            mode: 'beautify',
            commline: true,
            force_indent: true,
            wrap: 0
        };
        const result = stream.pipe(prettyDiff(options));
        this._cliLogger.end(work);
        return Promise.resolve(result);
    }


    /**
     * @inheritDocs
     * @returns {Promise<Stream>}
     */
    writeFiles(stream, path)
    {
        const work = this._cliLogger.work('Writing CoreMedia templates to filesystem at <' + path + '>');
        const result = stream.pipe(gulp.dest(path));
        this._cliLogger.end(work);
        return this.waitForEnd(result);
    }


    /**
     * @inheritDocs
     * @returns {Promise<Stream>}
     */
    compile(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            let stream = yield scope.compileEntities(parameters);
            if (parameters && parameters.beautify)
            {
                stream = yield scope.beautifyFiles(stream);
            }
            if (parameters && parameters.path)
            {
                stream = yield scope.writeFiles(stream, parameters.path);
            }
            return stream;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaCompiler = CoreMediaCompiler;
