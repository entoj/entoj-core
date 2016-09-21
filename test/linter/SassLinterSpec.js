"use strict";

/**
 * Requirements
 */
let SassLinter = require(SOURCE_ROOT + '/linter/SassLinter.js').SassLinter;
let sharedSpec = require('./LinterShared.js').spec;


/**
 * Spec
 */
describe(SassLinter.className, sharedSpec(SassLinter, 'linter/SassLinter', function()
{
    beforeEach(function()
    {
        fixtures =
        {
            source: `.myclass {}`,
            warningRules: { 'no-empty-rulesets': 1 }
        };
    });
}));
