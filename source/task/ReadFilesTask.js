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
class ReadFilesTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/ReadFilesTask';
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        if (!parameters || (!parameters.path && !parameters.readPath))
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        const path = parameters.path || parameters.readPath;
        this._cliLogger.info('Reading files from <' + path + '>');
        return gulp.src(path);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ReadFilesTask = ReadFilesTask;
