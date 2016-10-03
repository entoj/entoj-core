"use strict";

/**
 * Requirements
 */
const BaseRepository = require(SOURCE_ROOT + '/gulp/model/BaseRepository.js').BaseRepository;
const baseRepositorySpec = require(TEST_ROOT + '/gulp/model/BaseRepositoryShared.js');


/**
 * Spec
 */
describe(BaseRepository.className, function()
{
    /**
     * BaseRepository Test
     */
    baseRepositorySpec(BaseRepository, 'gulp.model/BaseRepository');
});
