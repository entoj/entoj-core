'use strict';

/**
 * Requirements
 * @ignore
 */
const isPlainObject = require('lodash.isplainobject');


/**
 * Runs multiple globs and combines the result
 * @memberof utils
 */
function iterable(object)
{
    if (isPlainObject(object))
    {
        const result = [];
        for (const key of Object.keys(object))
        {
            result.push([key, object[key]]);
        }
        return result;
    }
    return object;
}


/**
 * Exports
 * @ignore
 */
module.exports.iterable = iterable;
