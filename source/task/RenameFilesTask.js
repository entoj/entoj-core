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
class RenameFilesTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/RenameFilesTask';
    }


    /**
     * @param {VinylFile} file
     * @returns {VinylFile}
     */
    renameFile(file, buildConfiguration, parameters)
    {
        /* istanbul ignore next */
        if (!file)
        {
            return Promise.resolve();
        }
        let path = file.path;
        if (parameters && parameters.renameFiles)
        {
            for (const find in parameters.renameFiles)
            {
                const regex = new RegExp(find);
                const value = parameters.renameFiles[find];
                path = path.replace(regex, value);
            }
        }
        if (path && path !== file.path)
        {
            return Promise.resolve(new VinylFile({ path: path, contents: file.contents }));
        }
        return Promise.resolve(file);
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

        const section = this._cliLogger.section('Renaming files');

        // Render stream
        const resultStream = new Stream.Transform({ objectMode: true });
        resultStream._transform = (file, encoding, callback) =>
        {
            const fromPath = file.path;
            this.renameFile(file, buildConfiguration, parameters)
                .then((resultFile) =>
                {
                    if (resultFile)
                    {
                        const work = this._cliLogger.work('Renamed <' + fromPath + '> to <' + resultFile.path + '>');
                        resultStream.push(resultFile);
                        this._cliLogger.end(work);
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
module.exports.RenameFilesTask = RenameFilesTask;
