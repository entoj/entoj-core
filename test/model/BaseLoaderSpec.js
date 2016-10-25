"use strict";

/**
 * Requirements
 */
const BaseLoader = require(SOURCE_ROOT + '/model/BaseLoader.js').BaseLoader;
const baseLoaderSpec = require('./BaseLoaderShared.js').spec;

/**
 * Spec
 */
describe(BaseLoader.className, function()
{
    baseLoaderSpec(BaseLoader, 'model/BaseLoader');
});
