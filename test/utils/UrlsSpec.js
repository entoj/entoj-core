"use strict";

/**
 * Requirements
 */
let urlify = require(SOURCE_ROOT + '/utils/urls.js').urlify;

/**
 * Spec
 */
describe('utils/urls', function()
{
    describe('#urlify', function()
    {
        it('should replace any spaces with dashes', function()
        {
            expect(urlify('this is sparta')).to.be.equal('this-is-sparta');
        });

        it('should allow to configure the replacement for spaces', function()
        {
            expect(urlify('this is sparta', '_')).to.be.equal('this_is_sparta');
        });

        it('should lowercase all characters', function()
        {
            expect(urlify('ThisIsSparta')).to.be.equal('thisissparta');
        });

        it('should replace any non ascii characters with a ascii counter part', function()
        {
            expect(urlify('Ödipußi')).to.be.equal('odipussi');
        });
    });
});