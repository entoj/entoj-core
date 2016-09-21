'use strict';

/**
 * Requirements
 * @ignore
 */
const Context = require('../../application/Context.js').Context;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const Stream = require('stream');
const strip = require('../../utils/pathes.js').strip;


/**
 * @memberOf gulp.plugin
 */
function work(logger, message)
{
    const context = Context.instance;
    const pathes = context.di.create(PathesConfiguration);
    const stream = new Stream.Transform({ objectMode: true });
    stream._transform = function (file, encoding, callback)
    {
        file.work = logger.work(message.replace(/%s/, strip(file.path, pathes.root)));
        this.push(file);
        callback();
    };

    return stream;
}


/**
 *
 */
function end(logger)
{
    const stream = new Stream.Transform({ objectMode: true });
    stream._transform = function (file, encoding, callback)
    {
        if (file.work)
        {
            logger.end(file.work);
        }
        this.push(file);
        callback();
    };

    return stream;
}


/**
 * Public api
 */
module.exports =
{
    work: work,
    end: end
};
