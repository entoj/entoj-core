"use strict";

/**
 * Requirements
 */
let BaseRepository = require(SOURCE_ROOT + '/model/BaseRepository.js').BaseRepository;
let baseRepositorySpec = require('./BaseRepositoryShared.js').spec;


/**
 * Spec
 */
describe(BaseRepository.className, function()
{
    baseRepositorySpec(BaseRepository, 'model/BaseRepository');
});