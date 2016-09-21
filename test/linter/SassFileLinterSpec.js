
"use strict";

/**
 * Requirements
 */
let SassFileLinter = require(SOURCE_ROOT + '/linter/SassFileLinter.js').SassFileLinter;
let synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
let compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
let sharedSpec = require('./FileLinterShared.js').spec;
let co = require('co');
let path = require('path');

/**
 * Spec
 */
describe(SassFileLinter.className, sharedSpec(SassFileLinter, 'linter/SassFileLinter', function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.root = synchronize.execute(fixtures.pathes, 'resolveEntity', [fixtures.entityGallery]);
        fixtures.glob = ['/sass/*.scss'];
        fixtures.globCount = 1;
        fixtures.warningRules = { 'mixin-name-format': 1 };
        fixtures.warningCount = 1;
    });


    describe('#lint', function()
    {
       it('should accumulate results from all linted files', function()
        {
            let promise = co(function*()
            {
                let testee = new SassFileLinter(fixtures.warningRules);
                let result = yield testee.lint(fixtures.root);

                expect(result.success).to.be.not.ok;
                expect(result.files).to.have.length(fixtures.globCount);
                expect(result.warningCount).to.be.equal(fixtures.warningCount);
                expect(result.messages.find(message => message.filename.endsWith(path.sep + 'm001-gallery.scss'))).to.be.ok;
            });
            return promise;
        });
    });
}));
