'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Activates environment specific codes in any plain text sources
 */
class EnvironmentActivator extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'source/EnvironmentActivator';
    }


    /**
     * @param {*} content
     * @param {string} environment
     * @returns {Promise<Object>}
     */
    activate(source, environment)
    {
        let result = source;
        if (environment)
        {
            const regex = new RegExp('\\/\\*\\s*\\+environment\\s*:\\s*' + environment + '\\s*\\*\\/([^\\/]*)\\/\\*\\s+\\-environment\\s\\*\\/', 'igm');
            result = result.replace(regex, '$1');

        }
        result = result.replace(/\/\*\s*\+environment\s*:\s*\w+\s*\*\/[^\/]*\/\*\s+\-environment\s\*\//igm, '');
        return Promise.resolve(result);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EnvironmentActivator = EnvironmentActivator;
