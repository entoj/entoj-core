'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRepository = require('../BaseRepository.js').BaseRepository;
const SitesLoader = require('../site/SitesLoader.js').SitesLoader;


/**
 * @class
 * @memberOf model.site
 * @extends {Base}
 */
class SitesRepository extends BaseRepository
{
    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [SitesLoader] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.site/SitesRepository';
    }


    /**
     * @inheritDocs
     */
    loadAfter(items)
    {
        for (const item of items)
        {
            if (item.properties && item.properties.getByPath('extend', false))
            {
                const extend = item.properties.getByPath('extend').toLowerCase();
                item.extends = items.find(itm => itm.name.toLowerCase() === extend);
            }
        }

        return Promise.resolve();
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.SitesRepository = SitesRepository;
