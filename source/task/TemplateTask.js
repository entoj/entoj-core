'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const pathes = require('../utils/pathes.js');
const Stream = require('stream');
const VinylFile = require('vinyl');
const co = require('co');
const path = require('path');
const Environment = require('nunjucks').Environment;


/**
 * @memberOf task
 */
class TemplateTask extends BaseTask
{
    /**
     *
     */
    constructor(cliLogger)
    {
        super(cliLogger);
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/TemplateTask';
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const result = super.prepareParameters(buildConfiguration, parameters);
        result.passthroughFiles = result.passthroughFiles || ['.png', '.jpg', '.gif'];
        result.templateData = result.templateData || {};
        return result;
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        if (!stream)
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        // Prepare
        const params = this.prepareParameters(buildConfiguration, parameters);
        const section = this._cliLogger.section('Processing templates');
        const nunjucks = new Environment(undefined,
        {
            autoescape: false,
            throwOnUndefined: false,
            tags:
            {
                blockStart: '<%',
                blockEnd: '%>',
                variableStart: '<$',
                variableEnd: '$>',
                commentStart: '<#',
                commentEnd: '#>'
            }
        });

        // Render stream
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            console.log('Yes?', file.path);

            /* istanbul ignore next */
            if (!file || !file.isNull)
            {
                this._cliLogger.info('Invalid file <' + file + '>');
                callback();
                return;
            }

            // Check passthrough files
            if (params.passthroughFiles.indexOf(path.extname(file.path)) > -1)
            {
                this._cliLogger.info('Copying file <' + file.path + '>');
                resultStream.push(file);
                callback();
                return;
            }

            // Render template
            const work = this._cliLogger.work('Templating file <' + file.path + '>');
            try
            {
                const contents = nunjucks.renderString(file.contents.toString(), params.templateData);
                const resultFile = new VinylFile(
                {
                    path: file.path,
                    contents: new Buffer(contents)
                });
                resultStream.push(resultFile);
            }
            catch(e)
            {
                this._cliLogger.error(e);
            }
            this._cliLogger.end(work);
            callback();
        };

        // Wait for stream
        resultStream.on('finish', () =>
        {
            this._cliLogger.end(section);
        });

        return stream.pipe(resultStream);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TemplateTask = TemplateTask;
