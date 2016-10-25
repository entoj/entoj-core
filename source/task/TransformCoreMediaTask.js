'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const CoreMediaTransformer = require('../transformer/CoreMediaTransformer.js').CoreMediaTransformer;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const trimLeadingSlash = require('../utils/pathes.js').trimLeadingSlash;
const through2 = require('through2');
const VinylFile = require('vinyl');
const co = require('co');


/**
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
     * @returns {Promise<VinylFile>}
     */
    transformEntity(entity, settings)
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
            const options = settings || {};
            const macroName = options.macro || entity.idString.lodasherize();
            const basePath = options.flatten ? entity.site.name.urlify() : entity.pathString;
            const entityPath = basePath + '/' + entity.idString;
            let filename;
            if (options.filename)
            {
                filename = options.filename;

                // Add entity path if necessary
                if (filename.indexOf('/') == '-1')
                {
                    filename = trimLeadingSlash(basePath + '/' + filename);
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
    transformEntities(parameters)
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
                    // Update settings with global parameters
                    setting.flatten = params.flatten;

                    // Compile entity
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
}


/**
 * Exports
 * @ignore
 */
module.exports.TransformCoreMediaTask = TransformCoreMediaTask;
