'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRepository = require('../BaseRepository.js').BaseRepository;
const EntityCategoriesLoader = require('./EntityCategoriesLoader.js').EntityCategoriesLoader;


/**
 * @class
 * @memberOf model.entity
 * @extends {Base}
 */
class EntityCategoriesRepository extends BaseRepository
{
    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntityCategoriesLoader] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.entity/EntityCategoriesRepository';
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.EntityCategoriesRepository = EntityCategoriesRepository;
