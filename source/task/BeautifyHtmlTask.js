'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const prettydiff = require('prettydiff');
const Stream = require('stream');
const VinylFile = require('vinyl');


/**
 * @memberOf task
 */
class BeautifyHtmlTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/BeautifyHtmlTask';
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
        const options =
        {
            lang: 'html',
            mode: 'beautify',
            commline: true,
            force_indent: true,
            wrap: 0
        };
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            /* istanbul ignore next */
            if (!file || !file.isNull)
            {
                callback();
                return;
            }

            const work = this._cliLogger.work('Beautifying file <' + file.path + '>');
            const fileData = Object.assign({ source: file.contents.toString() }, options);
            const contents = new Buffer(prettydiff.api(fileData)[0]);
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
module.exports.BeautifyHtmlTask = BeautifyHtmlTask;
