
"use strict";

/**
 * Requirements
 */
const JsFileLinter = require(SOURCE_ROOT + '/linter/JsFileLinter.js').JsFileLinter;
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
const compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
const fileLinterSpec = require('./FileLinterShared.js');
const co = require('co');
const path = require('path');


/**
 * Spec
 */
describe(JsFileLinter.className, function()
{
    /**
     * JsFileLinter Fixture
     */
    const fixture = compact.createFixture();
    fixture.root = synchronize.execute(fixture.pathes, 'resolveEntity', [fixture.entityGallery]);
    fixture.glob = ['/js/*.js'];
    fixture.source = fixture.root;
    fixture.globCount = 2;
    fixture.warningRules = { 'no-undef': 1 };
    fixture.warningCount = 4;
    fixture.linterClassName = 'linter/JsLinter';


    /**
     * FileLinter Test
     */
    fileLinterSpec(JsFileLinter, 'linter/JsFileLinter', fixture);


    /**
     * JsFileLinter Test
     */
    describe('#lint', function()
    {
        it('should resolve to an array containing all linted files', function()
        {
            let promise = co(function*()
            {
                let testee = new JsFileLinter(fixture.warningRules);
                let result = yield testee.lint(fixture.root);

                expect(result.files.find(message => message.filename.endsWith(path.sep + 'm001-gallery.js'))).to.be.ok;
                expect(result.files.find(message => message.filename.endsWith(path.sep + 'm001-gallery-helper.js'))).to.be.ok;
            });
            return promise;
        });
    });
});

