"use strict";

/**
 * Requirements
 */
let create = require(SOURCE_ROOT + '/utils/map.js').create;

/**
 * Spec
 */
describe('utils/map', function()
{
    describe('#create', function()
    {
        it('should allow direct property access to map contents', function()
        {
            let testee = create();
            testee.set('foo', 'bar');
            expect(testee.foo).to.be.equal('bar');
        });

        it('should allow to enumerate properties', function()
        {
            let testee = create();
            testee.set('foo', 'bar');
            let keys = Object.keys(testee);
            expect(keys).to.have.length(2);
            expect(keys).to.contain('foo');
        });

        it('should allow to access map properties', function()
        {
            let testee = create();
            testee.set('foo', 'bar');
            expect(testee.size).to.be.equal(1);
        });

        it('should allow to access map methods', function()
        {
            let testee = create();
            testee.load({ 'foo': 'bar'});
            expect(testee.foo).to.be.equal('bar');
        });
    });
});