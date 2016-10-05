"use strict";

/**
 * Requirements
 */
const EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const baseRepositorySpec = require(TEST_ROOT + '/model/BaseRepositoryShared.js').spec;
const co = require('co');

/**
 * Spec
 */
describe(EntityCategoriesRepository.className, function()
{
    /**
     * BaseRepository Tests
     */
    baseRepositorySpec(EntityCategoriesRepository, 'model.entity/EntityCategoriesRepository');
});
