'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const VinylFile = require('vinyl');
const Stream = require('stream');
const templateString = require('es6-template-strings');


/**
 * Activates environment specific code
 *
 * @memberOf task
 */
class EnvironmentTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/EnvironmentTask';
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const result = super.prepareParameters(buildConfiguration, parameters);
        result.environment = result.environment || '';
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

        // Render stream
        const params = this.prepareParameters(buildConfiguration, parameters);
        this._cliLogger.info('Processing environments');
        this._cliLogger.options(params);
        const regex = new RegExp('\\/\\*\\s*\\+environment\\s*:\\s*' + params.environment + '\\s*\\*\\/([^\\/]*)\\/\\*\\s+\\-environment\\s\\*\\/', 'igm');
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            /* istanbul ignore next */
            if (!file || !file.isNull)
            {
                callback();
                return;
            }

            const work = this._cliLogger.work('Processing environment for file <' + file.path + '>');
            let contents = file.contents.toString();
            if (params.environment)
            {
                contents = contents.replace(regex, '$1');
            }
            contents = contents.replace(/\/\*\s*\+environment\s*:\s*\w+\s*\*\/[^\/]*\/\*\s+\-environment\s\*\//igm, '');
            const resultFile = new VinylFile(
                {
                    path: file.path,
                    contents: new Buffer(contents)
                });
            resultStream.push(resultFile);
            this._cliLogger.end(work);
            callback();
        };

        return stream.pipe(resultStream);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EnvironmentTask = EnvironmentTask;
