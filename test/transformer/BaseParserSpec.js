"use strict";

/**
 * Requirements
 */
const BaseParser = require(SOURCE_ROOT + '/transformer/BaseParser.js').BaseParser;
const baseParserSpec = require(TEST_ROOT + '/transformer/BaseParserShared.js');


/**
 * Spec
 */
describe(BaseParser.className, function()
{
    baseParserSpec(BaseParser, 'transformer/BaseParser');
});
