'use strict';

/**
 *
 */
class MissingArgumentError extends Error
{
    constructor(message)
    {
        super(message);
        this.name = 'MissingArgumentError';
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.MissingArgumentError = MissingArgumentError;
