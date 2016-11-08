'use strict';

const mergeWith = require('lodash.mergewith');
const clone = require('lodash.clone');


/**
 * Creates a instance of type with the given parameters
 *
 * @memberof utils
 */
function create(type, parameters)
{
    if (!parameters || parameters.length == 0)
    {
        return new type();
    }
    return new type(...parameters);
}


/**
 *  Function to test if an object is a plain object, i.e. is constructed
 *  by the built-in Object constructor and inherits directly from Object.prototype
 *  or null. Some built-in objects pass the test, e.g. Math which is a plain object
 *  and some host or exotic objects may pass also.
 *
 *  @see http://stackoverflow.com/questions/5876332/how-can-i-differentiate-between-an-object-literal-other-javascript-objects
 *  @param {*} value - value to test
 *  @memberOf utils
 *  @returns {Boolean}
 */
function isPlainObject(value)
{
    if (!value || typeof value !== 'object')
    {
        return false;
    }

    // Basic check for Type object that's not null
    if (typeof value == 'object' && value !== null)
    {
        // If Object.getPrototypeOf supported, use it
        if (typeof Object.getPrototypeOf == 'function')
        {
            var proto = Object.getPrototypeOf(value);
            return proto === Object.prototype || proto === null;
        }

        // Otherwise, use internal class
        // This should be reliable as if getPrototypeOf not supported, is pre-ES5
        return Object.prototype.toString.call(value) == '[object Object]';
    }

    // Not an object
    return false;
}


/**
 *  Tests if given value is empty.
 *  Empty are all falsy values and empty arrays / maps.
 *
 *  @param {*} value - value to test
 *  @memberOf utils
 *  @returns {Boolean}
 */
function isEmpty(value)
{
    if (Number.isFinite(value))
    {
        return false;
    }
    if (Array.isArray(value))
    {
        return value.length === 0;
    }
    if (value && value instanceof Map)
    {
        return value.size === 0;
    }
    if (value && value instanceof Map)
    {
        return value.size === 0;
    }
    if (isPlainObject(value))
    {
        return Object.keys(value).length === 0;
    }
    if (value)
    {
        return false;
    }

    return !value;
}


/**
 *  @memberOf utils
 *  @returns {Object}
 */
function merge(object, ...merges)
{
    let result = clone(object);
    mergeWith(result, ...merges, function(objValue, srcValue)
    {
        if (Array.isArray(objValue))
        {
            return objValue.concat(srcValue);
        }
    });
    return result;
}


/**
 * Exports
 * @ignore
 */
module.exports.create = create;
module.exports.isPlainObject = isPlainObject;
module.exports.isEmpty = isEmpty;
module.exports.merge = merge;
