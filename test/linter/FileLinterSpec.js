"use strict";

/**
 * Requirements
 */
const FileLinter = require(SOURCE_ROOT + '/linter/FileLinter.js').FileLinter;
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const fileLinterSpec = require('./FileLinterShared.js');


/**
 * Spec
 */
describe(FileLinter.className, function()
{
    /**
     * FileLinter Fixture
     */
    const fixture = compact.createFixture();
    fixture.root = synchronize.execute(fixture.pathes, 'resolveEntity', [fixture.entityGallery]);
    fixture.glob = ['/js/*.js'];
    fixture.source = fixture.root;
    fixture.globCount = 2;

    /**
     * BaseLinter Test
     */
    fileLinterSpec(FileLinter, 'linter/FileLinter', fixture);
});
