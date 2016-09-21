'use strict';

/**
 * Requirements
 * @ignore
 */
const MissingArgumentError = require('../error/MissingArgumentError.js').MissingArgumentError;


/**
 * Checks a parameter for required and type
 *
 * @memberof utils
 * @param {string} name
 * @param {mixed} value
 * @param {bool} required
 * @param {class} type
 * @returns {void}
 */
function assertParameter(instance, name, value, required, type)
{
    if (required && !value)
    {
        //console.log(`${instance.className} - Missing parameter ${name}`);
        throw new MissingArgumentError(`${instance.className} - Missing parameter ${name}`);
    }
    if (value && type)
    {
        const types = Array.isArray(type) ? type : [type];
        let ok = false;
        for (const t of types)
        {
            if (value instanceof t)
            {
                ok = true;
            }
        }
        if (!ok)
        {
            //console.log(`${instance.className} - ${name} must of of type ${type.className}`);
            throw new TypeError(`${instance.className} - ${name} must be of type ${type.className} but is of type ${value.className}`);
        }
    }
}

module.exports.assertParameter = assertParameter;
