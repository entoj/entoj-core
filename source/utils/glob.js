'use strict';

const _glob = require('glob');
const async = require('async');
const pathes = require('./pathes.js');

/**
 * Runs multiple globs and combines the result
 * @memberof utils
 */
function glob(patterns, options)
{
    const promise = new Promise(function(resolve, reject)
    {
        const result = [];
        const tasks = [];
        const p = Array.isArray(patterns) ? patterns : [patterns];
        for (const pattern of p)
        {
            tasks.push(function(cb)
            {
                _glob(pattern, options, function (error, files)
                {
                    if (files)
                    {
                        for(const file of files)
                        {
                            result.push(pathes.normalize(file));
                        }
                    }
                    cb();
                });
            });
        }
        async.parallel(tasks, function()
        {
            resolve(result);
        });
    });
    return promise;
}


/**
 * Exports
 * @ignore
 */
module.exports = glob;
