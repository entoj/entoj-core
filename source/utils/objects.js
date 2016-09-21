'use strict';

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
    if (parameters.length == 1)
    {
        return new type(parameters[0]);
    }
    if (parameters.length == 2)
    {
        return new type(parameters[0], parameters[1]);
    }
    if (parameters.length == 3)
    {
        return new type(parameters[0], parameters[1], parameters[2]);
    }
    if (parameters.length == 4)
    {
        return new type(parameters[0], parameters[1], parameters[2], parameters[3]);
    }
    if (parameters.length == 5)
    {
        return new type(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
    }
    if (parameters.length == 6)
    {
        return new type(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]);
    }
    if (parameters.length == 7)
    {
        return new type(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5], parameters[6]);
    }
    if (parameters.length == 8)
    {
        return new type(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5], parameters[6], parameters[7]);
    }
    return undefined;
}


/**
 * Exports
 * @ignore
 */
module.exports.create = create;
