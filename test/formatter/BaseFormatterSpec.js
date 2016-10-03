"use strict";

/**
 * Requirements
 */
const BaseFormatter = require(SOURCE_ROOT + '/formatter/BaseFormatter.js').BaseFormatter;
const baseFormatterSpec = require(TEST_ROOT + '/formatter/BaseFormatterShared.js');


/**
 * Spec
 */
describe(BaseFormatter.className, function()
{
    baseFormatterSpec(BaseFormatter, 'formatter/BaseFormatter');
});
