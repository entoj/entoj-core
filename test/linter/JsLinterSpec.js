"use strict";

/**
 * Requirements
 */
let JsLinter = require(SOURCE_ROOT + '/linter/JsLinter.js').JsLinter;
let sharedSpec = require('./LinterShared.js').spec;


/**
 * Spec
 */
describe(JsLinter.className, sharedSpec(JsLinter, 'linter/JsLinter', function()
{
    beforeEach(function()
    {
        fixtures =
        {
            source: `var a="1";`,
            warningRules: { 'quotes': [1, 'single'] }
        };
    });
}));