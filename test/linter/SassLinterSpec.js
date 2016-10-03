"use strict";

/**
 * Requirements
 */
const SassLinter = require(SOURCE_ROOT + '/linter/SassLinter.js').SassLinter;
const baseLinterSpec = require('./BaseLinterShared.js');


/**
 * Spec
 */
describe(SassLinter.className, function()
{
    /**
     * SassLinter Fixture
     */
    const fixture =
    {
        source: `.myclass {}`,
        warningRules: { 'no-empty-rulesets': 1 },
        warningCount: 1
    };

    /**
     * BaseLinter Test
     */
    baseLinterSpec(SassLinter, 'linter/SassLinter', fixture);
});
