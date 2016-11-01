'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const VinylFile = require('vinyl');
const Stream = require('stream');
const activateEnvironment = require('../utils/string.js').activateEnvironment;


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
            const contents = activateEnvironment(file.contents.toString(), params.environment);
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
