'use strict';

/**
 * Requirements
 * @ignore
 */
const PluggableLoader = require('../loader/PluggableLoader.js').PluggableLoader;
const PathesConfiguration = require('../configuration/PathesConfiguration.js').PathesConfiguration;
const Site = require('./Site.js').Site;
const assertParameter = require('../../utils/assert.js').assertParameter;
const co = require('co');
const fs = require('mz/fs');
const path = require('path');
const upperFirst = require('lodash.upperfirst');


/**
 * @class
 * @memberOf mode.site
 * @extends {BaseLoader}
 */
class SitesLoader extends PluggableLoader
{
    /**
     * @ignore
     */
    constructor(pathesConfiguration, plugins)
    {
        super(plugins);

        //Check params
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._pathesConfiguration = pathesConfiguration;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'model.site/SitesLoader.plugins'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.site/SitesLoader';
    }


    /**
     * Loads all basic site information
     *
     * @returns {Promise.<Array>}
     */
    loadItems()
    {
        const scope = this;
        const promise = co(function *()
        {
            if (scope._pathesConfiguration)
            {
                const result = [];
                const basePath = scope._pathesConfiguration.sites;
                const directories = yield fs.readdir(basePath);
                for (const directory of directories)
                {
                    if (!directory.startsWith('.'))
                    {
                        result.push(new Site(upperFirst(path.basename(directory))));
                    }
                }
                return result;
            }
        });
        return promise;
    }


    /**
     * @inheritDoc
     */
    finalize(items)
    {
        const parent = super.finalize(items);
        const promise = co(function *()
        {
            // Get parent items
            const items = yield parent;

            // Find a site by name
            const find = function(name)
            {
                return items.find(item => item.name.toLowerCase() === name.toLowerCase());
            };

            // Add extends
            for (const item of items)
            {
                if (item.properties.get('extends'))
                {
                    item.extends = find(item.properties.get('extends'));
                }
            }

            return items;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.SitesLoader = SitesLoader;
