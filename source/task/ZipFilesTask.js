'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const gulp = require('gulp');
const zip = require('gulp-zip');


/**
 * @memberOf task
 */
class ZipFilesTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/ZipFilesTask';
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

        const filename = parameters.zipFilename || 'all.zip';
        const work = this._cliLogger.section('Ziping files into <' + filename + '>');
        const resultStream = stream.pipe(zip(filename));
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
module.exports.ZipFilesTask = ZipFilesTask;
