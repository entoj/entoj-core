'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const gulp = require('gulp');
const Stream = require('stream');
const VinylFile = require('vinyl');


/**
 * @memberOf task
 */
class RemoveFilesTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/RemoveFilesTask';
    }


    /**
     * @param {VinylFile} file
     * @param {model.configuration.BuildConfiguration} buildConfiguration
     * @param {Object} parameters
     * @returns {VinylFile}
     */
    removeFile(file, buildConfiguration, parameters)
    {
        /* istanbul ignore next */
        if (!file)
        {
            return Promise.resolve();
        }

        const path = file.path;
        if (path && parameters && parameters.removeFiles)
        {
            for (const remove of parameters.removeFiles)
            {
                if (path.match(new RegExp(remove)))
                {
                    return Promise.resolve();
                }
            }
        }

        return Promise.resolve(file);
    }


    /**
     * @inheritDocs
     */
    stream(stream, buildConfiguration, parameters)
    {
        if (!stream)
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        const section = this._cliLogger.section('Removing files');

        // Render stream
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            const fromPath = file.path;
            this.removeFile(file, buildConfiguration, parameters)
                .then((resultFile) =>
                {
                    if (!resultFile)
                    {
                        const work = this._cliLogger.work('Removing <' + file.path + '>');
                        this._cliLogger.end(work);
                    }
                    else
                    {
                        resultStream.push(resultFile);
                    }
                    callback();
                })
                .catch((error) =>
                {
                    /* istanbul ignore next */
                    this.logger.error(error);
                    /* istanbul ignore next */
                    callback();
                });
        };

        // Wait for stream
        resultStream.on('finish', () =>
        {
            this._cliLogger.end(section);
        });

        return stream.pipe(resultStream);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.RemoveFilesTask = RemoveFilesTask;
