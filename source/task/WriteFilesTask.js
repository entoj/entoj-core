'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const gulp = require('gulp');


/**
 * @memberOf task
 */
class WriteFilesTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/WriteFilesTask';
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

        const work = this._cliLogger.work('Writing files to filesystem at <' + parameters.path + '>');
        const resultStream = stream.pipe(gulp.dest(parameters.path));
        resultStream.on('finish', () =>
        {
            this._cliLogger.end(work);
        });

        return resultStream;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.WriteFilesTask = WriteFilesTask;
