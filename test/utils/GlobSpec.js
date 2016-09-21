"use strict";

/**
 * Requirements
 */
const glob = require(SOURCE_ROOT + '/utils/glob.js');
const PATH_SEPERATOR = require('path').sep;

/**
 * Spec
 */
describe('utils/glob', function()
{
    describe('#glob', function()
    {
        it('should return a promise', function()
        {
            const path = FIXTURES_ROOT + PATH_SEPERATOR + 'Entities' + PATH_SEPERATOR + 'Compact' + PATH_SEPERATOR + 'default' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery';
            const pathes = path + PATH_SEPERATOR + '*.j2';
            expect(glob(pathes)).to.be.instanceof(Promise);
        });

        it('should glob all files in a single directory', function(cb)
        {
            const path = FIXTURES_ROOT + PATH_SEPERATOR + 'Entities' + PATH_SEPERATOR + 'Compact' + PATH_SEPERATOR + 'default' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery';
            const pathes = path + '/*.j2';
            glob(pathes).then((files) =>
            {
                expect(files).to.contain(path + PATH_SEPERATOR + 'm001-gallery.j2');
                cb();
            })
            .catch((e) =>
            {
                cb(e);
            });
        });

        it('should glob all files in multiple directories', function(cb)
        {
            const path = FIXTURES_ROOT + PATH_SEPERATOR + 'Entities' + PATH_SEPERATOR + 'Compact' + PATH_SEPERATOR + 'default' + PATH_SEPERATOR + 'modules' + PATH_SEPERATOR + 'm001-gallery';
            const pathes = [path + PATH_SEPERATOR + '*.j2', path + PATH_SEPERATOR + 'macros' + PATH_SEPERATOR + '*.j2'];
            glob(pathes).then((files) =>
            {
                expect(files).to.be.ok;
                expect(files).to.contain(path + PATH_SEPERATOR + 'm001-gallery.j2');
                expect(files).to.contain(path + PATH_SEPERATOR + 'macros' + PATH_SEPERATOR + 'helper.j2');
                cb();
            })
            .catch((e) =>
            {
                cb(e);
            });
        });

    });
});
