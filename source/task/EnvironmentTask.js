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
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        if (!stream)
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        // Render stream
        const environment = parameters ? parameters.environment || false : false;
        const regex = new RegExp('\\/\\*\\s*\\+environment\\s*:\\s*' + environment + '\\s*\\*\\/([^\\/]*)\\/\\*\\s+\\-environment\\s\\*\\/', 'igm');
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            /* istanbul ignore next */
            if (!file || !file.isNull)
            {
                callback();
                return;
            }

            const work = this._cliLogger.work('Processing environments for file <' + file.path + '>');
            let contents = file.contents.toString();
            if (environment)
            {
                contents = contents.replace(regex, '$1');
            }
            contents = contents.replace(/\/\*\s*\+environment\s*:\s*\w+\s*\*\/[^\/]*\/\*\s+\-environment\s\*\//igm, '');
            const resultFile = new VinylFile({ path: file.path, contents: new Buffer(contents) });
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
