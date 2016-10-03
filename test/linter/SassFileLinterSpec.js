"use strict";

/**
 * Requirements
 */
const SassFileLinter = require(SOURCE_ROOT + '/linter/SassFileLinter.js').SassFileLinter;
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const fileLinterSpec = require('./FileLinterShared.js');
const co = require('co');
const path = require('path');


/**
 * Spec
 */
describe(SassFileLinter.className, function()
{
    /**
     * SassFileLinter Fixture
     */
    const fixture = compact.createFixture();
    fixture.root = synchronize.execute(fixture.pathes, 'resolveEntity', [fixture.entityGallery]);
    fixture.glob = ['/sass/*.scss'];
    fixture.source = fixture.root;
    fixture.globCount = 1;
    fixture.warningRules = { 'mixin-name-format': 1 };
    fixture.warningCount = 1;
    fixture.linterClassName = 'linter/SassLinter';


    /**
     * FileLinter Test
     */
    fileLinterSpec(SassFileLinter, 'linter/SassFileLinter', fixture);


    /**
     * SassFileLinter Test
     */
    describe('#lint', function()
    {
        it('should resolve to an array containing all linted files', function()
        {
            const promise = co(function*()
            {
                const testee = new SassFileLinter(fixture.warningRules);
                const result = yield testee.lint(fixture.root);

                expect(result.messages.find(message => message.filename.endsWith(path.sep + 'm001-gallery.scss'))).to.be.ok;
            });
            return promise;
        });
    });
});

