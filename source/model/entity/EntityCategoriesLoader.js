'use strict';

/**
 * Requirements
 * @ignore
 */
const PluggableLoader = require('../loader/PluggableLoader.js').PluggableLoader;
const EntityCategory = require('./EntityCategory.js').EntityCategory;

/**
 * @class
 *
 * Creates EntityCategory from a simple json configuration.
 *
 * @memberOf mode.site
 * @extends {BaseLoader}
 */
class EntityCategoriesLoader extends PluggableLoader
{
    /**
     * @ignore
     */
    constructor(categories, plugins)
    {
        super(plugins);

        // Assign options
        this._categories = categories || [];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['model.entity/EntityCategoriesLoader.categories', 'model.entity/EntityCategoriesLoader.plugins'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.entity/EntityCategoriesLoader';
    }


    /**
     * @returns {Promise.<Array>}
     */
    loadItems()
    {
        const result = [];
        for (const config of this._categories)
        {
            const item = new EntityCategory(config.longName, config.pluralName, config.shortName, config.isGlobal);
            result.push(item);
        }
        return Promise.resolve(result);
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.EntityCategoriesLoader = EntityCategoriesLoader;
