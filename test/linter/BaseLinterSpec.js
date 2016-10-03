"use strict";

/**
 * Requirements
 */
const BaseLinter = require(SOURCE_ROOT + '/linter/BaseLinter.js').BaseLinter;
const baseLinterSpec = require(TEST_ROOT + '/linter/BaseLinterShared.js');


/**
 * Spec
 */
describe(BaseLinter.className, function()
{
    baseLinterSpec(BaseLinter, 'linter/BaseLinter');
});
