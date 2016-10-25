'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const assertParameter = require('../utils/assert.js').assertParameter;
const through2 = require('through2');


/**
 * @memberOf task
 */
class BaseTask extends Base
{
    /**
     *
     */
    constructor(cliLogger)
    {
        super();

        //Check params
        assertParameter(this, 'cliLogger', cliLogger, true, CliLogger);

        // Assign options
        this._cliLogger = cliLogger;
        this._previousTask = false;
        this._nextTask = false;
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/BaseTask';
    }


    /**
     * @inheritDocs
     */
    get nextTask()
    {
        return this._nextTask;
    }

    /**
     * @inheritDocs
     */
    set nextTask(value)
    {
        this._nextTask = value;
    }


    /**
     * @inheritDocs
     */
    get previousTask()
    {
        return this._previousTask;
    }

    /**
     * @inheritDocs
     */
    set previousTask(value)
    {
        this._previousTask = value;
    }


    /**
     * @returns {Stream}
     */
    pipe(task)
    {
        this.nextTask = task;
        task.previousTask = this;
        return task;
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        let resultStream = stream;
        if (!resultStream)
        {
            resultStream = through2(
                {
                    objectMode: true
                });
            resultStream.write(false); // this helps testing when stream is not implemented
            resultStream.end();
        }
        return resultStream;
    }


    /**
     * @returns {Promise<Stream>}
     */
    run(buildConfiguration, parameters)
    {
        // Part of a chain?
        if (this._previousTask)
        {
            return this._previousTask.run(buildConfiguration, parameters);
        }

        // Start the task
        const promise = new Promise((resolve) =>
        {
            const work = this._cliLogger.section('Running task ' + this.className);
            let stream = this.stream(undefined, buildConfiguration, parameters);

            // Handle chain
            let currentTask = this.nextTask;
            while (currentTask)
            {
                stream = currentTask.stream(stream, buildConfiguration, parameters);
                currentTask = currentTask.nextTask;
            }

            // Wait for stream end
            if (stream._readableState && stream._readableState.ended)
            {
                resolve();
            }
            else
            {
                stream.on('finish', () =>
                {
                    this._cliLogger.end(work);
                    resolve();
                });
            }
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseTask = BaseTask;
