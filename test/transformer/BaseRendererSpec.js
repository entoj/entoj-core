'use strict';

/**
 * Requirements
 */
const BaseRenderer = require(SOURCE_ROOT + '/transformer/BaseRenderer.js').BaseRenderer;
const baseRendererSpec = require(TEST_ROOT + '/transformer/BaseRendererShared.js');


/**
 * Spec
 */
describe(BaseRenderer.className, function()
{
    baseRendererSpec(BaseRenderer, 'transformer/BaseRenderer');
});
