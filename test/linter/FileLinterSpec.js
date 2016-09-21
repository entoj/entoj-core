"use strict";

/**
 * Requirements
 */
let FileLinter = require(SOURCE_ROOT + '/linter/FileLinter.js').FileLinter;
let synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
let compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
let sharedSpec = require('./FileLinterShared.js').spec;


/**
 * Spec
 */
describe(FileLinter.className, sharedSpec(FileLinter, 'linter/FileLinter', function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.root = synchronize.execute(fixtures.pathes, 'resolveEntity', [fixtures.entityGallery]);
        fixtures.glob = ['/js/*.js'];
        fixtures.globCount = 2;
        fixtures.warningRules = { 'no-empty-rulesets': 1 };
    });
}));
