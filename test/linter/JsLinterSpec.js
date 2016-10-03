"use strict";

/**
 * Requirements
 */
const JsLinter = require(SOURCE_ROOT + '/linter/JsLinter.js').JsLinter;
const baseLinterSpec = require('./BaseLinterShared.js');


/**
 * Spec
 */
describe(JsLinter.className, function()
{
    /**
     * JsLinter Fixture
     */
    const fixture =
    {
        source: `var a="1";`,
        warningRules: { 'quotes': [1, 'single'] },
        warningCount: 1
    };

    /**
     * BaseLinter Test
     */
    baseLinterSpec(JsLinter, 'linter/JsLinter', fixture);
});
