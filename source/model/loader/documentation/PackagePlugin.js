'use strict';

/**
 * Requirements
 * @ignore
 */
const LoaderPlugin = require('../LoaderPlugin.js').LoaderPlugin;
const PathesConfiguration = require('../../configuration/PathesConfiguration.js').PathesConfiguration;
const Entity = require('../../entity/Entity.js').Entity;
const assertParameter = require('../../../utils/assert.js').assertParameter;
const co = require('co');
const fs = require('mz/fs');

/**
 * Reads a package.json
 */
class PackagePlugin extends LoaderPlugin
{
    /**
     * @param {configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(pathesConfiguration, options)
    {
        super();

        //Check params
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        const opts = options || {};
        this._pathesConfiguration = pathesConfiguration;
        this._filename = opts.filename || '/package.json';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'model.loader.documentation/PackagePlugin.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader.documentation/PackagePlugin';
    }


    /**
     * @property {string}
     */
    get filename()
    {
        return this._filename;
    }


    /**
     * @param {BaseValueObject} item
     */
    executeFor(item, site)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Get filename
            let filename;
            if (!site)
            {
                filename = yield scope._pathesConfiguration.resolve(item, scope.filename);
            }
            else if (item instanceof Entity)
            {
                filename = yield scope._pathesConfiguration.resolveEntityForSite(item, site, scope.filename);
            }
            else
            {
                throw new TypeError('Unable to handle given item');
            }

            // Check file
            const exists = yield fs.exists(filename);
            if (!exists)
            {
                //Promise.reject(`${scope.className}::execute could not find ${filename}`);
                return false;
            }

            // Read it
            const content = yield fs.readFile(filename);
            if (!content)
            {
                Promise.reject(`${scope.className}::execute could not read ${filename}`);
                return false;
            }

            // Parse it
            let data = false;
            try
            {
                data = JSON.parse(content);
            }
            catch(e)
            {
                Promise.reject(`${scope.className}::execute could not parse ${filename}`);
                return false;
            }

            // Add data to item
            if (data)
            {
                // Get site
                let s = site;
                if (!s && item.id && item.id.site)
                {
                    s = item.id.site;
                }

                // Add namespaced
                if (s)
                {
                    const namespacedData = {};
                    namespacedData[s.name.toLowerCase()] = data;
                    item.properties.load(namespacedData);
                }
                // Add straight
                else
                {
                    item.properties.load(data);
                }
            }

            return true;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.PackagePlugin = PackagePlugin;
