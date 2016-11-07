'use strict';

const tr = require('transliteration').transliterate;


/**
 * Makes a vali ascii only url
 *
 * @memberOf utils
 */
function urlify(value, whitespace)
{
    let result = tr(value).toLowerCase();
    result = result.replace(/\s/g, whitespace || '-');
    return result;
}


/**
 * Replaces any path seperator to /
 *
 * @memberof utils
 */
function normalizePathSeperators(path)
{
    return path.replace(/\\|\//g, '/');
}


/**
 * Removes a leading slash
 *
 * @memberof utils
 */
function trimLeadingSlash(path)
{
    let result = normalizePathSeperators(path);
    if (result.substr(0, 1) === '/')
    {
        result = result.substr(1);
    }
    return result;
}


/**
 * Makes the given string a valid url
 *
 * @memberof utils
 */
function normalize(path)
{
    let result = path || '';
    result = result.replace(/\\|\//g, '/');
    if (!result.startsWith('/'))
    {
        result = '/' + result;
    }
    if (result.endsWith('/'))
    {
        result = result.substr(0, result.length - 1);
    }
    return result;
}


/**
 * Removes the first part of a path
 *
 * @memberof utils
 */
function shift(path)
{
    const parts = normalize(path).split('/');
    if (parts.length > 0 && parts[0] === '')
    {
        parts.shift();
    }
    parts.shift();
    return normalize(parts.join('/'));
}


/**
 * Exports
 * @ignore
 */
module.exports.shift = shift;
module.exports.trimLeadingSlash = trimLeadingSlash;
module.exports.normalizePathSeperators = normalizePathSeperators;
module.exports.normalize = normalize;
module.exports.urlify = urlify;
