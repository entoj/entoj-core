"use strict";

/**
 * Requirements
 */
let BaseLoader = require(SOURCE_ROOT + '/model/BaseLoader.js').BaseLoader;
let baseLoaderSpec = require('./BaseLoaderShared.js').spec;

/**
 * Spec
 */
describe(BaseLoader.className, function()
{
    baseLoaderSpec(BaseLoader, 'model/BaseLoader');
});
