'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseLoader = require('../BaseLoader.js').BaseLoader;
const co = require('co');


/**
 * @class
 * @memberOf mode.loader
 * @extends {BaseLoader}
 */
class PluggableLoader extends BaseLoader
{
    /**
     * @ignore
     */
    constructor(plugins, items)
    {
        super(items);
        this._plugins = plugins || [];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['model.site/PluggableLoader.plugins'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.loader/PluggableLoader';
    }


    /**
     * @property {LoaderPlugin}
     */
    get plugins()
    {
        return this._plugins;
    }


    /**
     * Executes all registered plugins for the given item
     *
     * @returns {Promise.<Bool>}
     */
    executePluginsForItem(item)
    {
        const scope = this;
        const promise = co(function *()
        {
            for (const plugin of scope._plugins)
            {
                yield plugin.execute(item);
            }
            return true;
        })
        .catch((e) =>
        {
            this.logger.error(e);
        });
        return promise;
    }


    /**
     * Loads all items
     *
     * @param {*} hint
     * @returns {Promise.<Array>}
     */
    loadItems(items)
    {
        return Promise.resolve(this._items);
    }


    /**
     * Allows to modify/finalize the loaded list before it is
     * returned to the client.
     *
     * @returns {Promise.<Array>}
     */
    finalize(items)
    {
        return Promise.resolve(items);
    }


    /**
     * @inheritDocs
     */
    load(items)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Get items
            let result = yield scope.loadItems(items);

            // Apply plugins
            for (const item of result)
            {
                yield scope.executePluginsForItem(item);
            }

            // Last chance for modifications
            result = yield scope.finalize(result);

            // Assign & return
            scope._items = result;
            return scope._items;
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.PluggableLoader = PluggableLoader;
