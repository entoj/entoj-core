"use strict";

/**
 * Requirements
 */
let EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
let baseRepositorySpec = require('../BaseRepositoryShared.js').spec;

/**
 * Spec
 */
describe(EntityCategoriesRepository.className, function()
{
    baseRepositorySpec(EntityCategoriesRepository, 'model.entity/EntityCategoriesRepository');
});