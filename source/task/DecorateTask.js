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
 * @memberOf task
 */
class DecorateTask extends BaseTask
{
    /**
     *
     */
    constructor(cliLogger, prependTemplate, appendTemplate)
    {
        super(cliLogger);

        // Assign options
        this._prependTemplate = prependTemplate || '';
        this._appendTemplate = appendTemplate || '';
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/DecorateTask';
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        if (!stream || !parameters || !parameters.path)
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        // Render stream
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            /* istanbul ignore next */
            if (!file || !file.isNull)
            {
                callback();
                return;
            }

            const work = this._cliLogger.work('Adding banner to file <' + file.path + '>');
            const params = parameters || {};
            const prepend = templateString(this._prependTemplate, params);
            const append = templateString(this._appendTemplate, params);
            const contents = new Buffer(prepend + file.contents.toString() + append);
            const resultFile = new VinylFile({ path: file.path, contents: contents });
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
module.exports.DecorateTask = DecorateTask;
