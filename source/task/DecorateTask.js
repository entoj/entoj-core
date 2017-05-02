'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
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
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const params = parameters || {};
        const result =
        {
            decorateVariables: params.decorateVariables || {},
            decoratePrepend: params.decoratePrepend || this._prependTemplate,
            decorateAppend: params.decorateAppend || this._appendTemplate,
            decorateEnabled: (typeof params.decorateEnabled !== 'undefined') ? params.decorateEnabled === true : true
        };
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
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            /* istanbul ignore next */
            if (!file || !file.isNull || !file.contents)
            {
                callback();
                return;
            }

            if (params.decorateEnabled)
            {
                const work = this._cliLogger.work('Adding banner to file <' + file.path + '>');
                const prepend = templateString(params.decoratePrepend, params.decorateVariables);
                const append = templateString(params.decorateAppend, params.decorateVariables);
                const contents = new Buffer(prepend + file.contents.toString() + append);
                const resultFile = new VinylFile({ path: file.path, contents: contents });
                resultStream.push(resultFile);
                this._cliLogger.end(work);
            }
            else
            {
                resultStream.push(file);
            }
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
