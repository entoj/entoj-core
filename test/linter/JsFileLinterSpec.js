
"use strict";

/**
 * Requirements
 */
let JsFileLinter = require(SOURCE_ROOT + '/linter/JsFileLinter.js').JsFileLinter;
let synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
let compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
let sharedSpec = require('./FileLinterShared.js').spec;
let co = require('co');
let path = require('path');

/**
 * Spec
 */
describe(JsFileLinter.className, sharedSpec(JsFileLinter, 'linter/JsFileLinter', function()
{
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.root = synchronize.execute(fixtures.pathes, 'resolveEntity', [fixtures.entityGallery]);
        fixtures.glob = ['/js/*.js'];
        fixtures.globCount = 2;
        fixtures.warningRules = { 'no-undef': 1 };
        fixtures.warningCount = 8;
    });


    describe('#lint', function()
    {
        it('should accumulate results from all linted files', function()
        {
            let promise = co(function*()
            {
                let testee = new JsFileLinter(fixtures.warningRules);
                let result = yield testee.lint(fixtures.root);

                expect(result.success).to.be.not.ok;
                expect(result.files).to.have.length(fixtures.globCount);
                expect(result.warningCount).to.be.equal(4);
                expect(result.files.find(message => message.filename.endsWith(path.sep + 'm001-gallery.js'))).to.be.ok;
                expect(result.files.find(message => message.filename.endsWith(path.sep + 'm001-gallery-helper.js'))).to.be.ok;
            });
            return promise;
        });
    });
}));
