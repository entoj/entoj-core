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
        if (!stream || !parameters || (!parameters.path && !parameters.writePath))
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        const path = parameters.path || parameters.writePath;
        const work = this._cliLogger.section('Writing files to filesystem at <' + path + '>');
        const resultStream = stream.pipe(gulp.dest(path));
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
