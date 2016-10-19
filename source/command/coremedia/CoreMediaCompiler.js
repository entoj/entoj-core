'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const GlobalRepository = require('../../model/GlobalRepository.js').GlobalRepository;
const trimLeadingSlash = require('../../utils/pathes.js').trimLeadingSlash;
const assertParameter = require('../../utils/assert.js').assertParameter;
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
    constructor(cliLogger, globalRepository)
    {
        super();

        //Check params
        assertParameter(this, 'cliLogger', cliLogger, true, CliLogger);
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);

        // Assign options
        this._cliLogger = cliLogger;
        this._globalRepository = globalRepository;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, GlobalRepository, 'command.coremedia/CoreMediaCompiler.options'] };
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
        // Prepare
        const macro = settings.macro || entity.idString.lodasherize();
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
        const work = this._cliLogger.work('Compiling CoreMedia template for <' + entity.idString + '> as <' + filename + '>');
        const contents = 'Hello world';
        this._cliLogger.end(work);

        // Done
        const file = new VinylFile(
            {
                path: filename,
                contents: new Buffer(contents)
            });
        return Promise.resolve(file);
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
