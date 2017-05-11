'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const babel = require('babel-core');
const Stream = require('stream');
const VinylFile = require('vinyl');


/**
 * @memberOf task
 */
class TranspileJsTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/TranspileJsTask';
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
            presets: [require('babel-preset-es2015')],
            //plugins: ['transform-runtime'],
            babelrc: false
        };
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            /* istanbul ignore next */
            if (!file || !file.isNull || !file.contents)
            {
                callback();
                return;
            }

            const work = this._cliLogger.work('Transpiling file <' + file.path + '>');
            const contents = new Buffer(babel.transform(file.contents.toString(), options).code);
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
module.exports.TranspileJsTask = TranspileJsTask;
