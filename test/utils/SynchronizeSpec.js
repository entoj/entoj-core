"use strict";

/**
 * Requirements
 */
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js').synchronize;

/**
 * Spec
 */
describe('utils/synchronize', function()
{
    class Testee
    {
        constructor()
        {
            this._property = 'Testee';
        }

        get property()
        {
            return this._property;
        }

        set property(value)
        {
            this._property = value;
        }

        async()
        {
            return Promise.resolve('Async');
        }

        sync()
        {
            return 'Sync';
        }
    }


    describe('#synchronize', function()
    {
        it('should synchronize methods returning a Promise', function()
        {
            const testee = synchronize(new Testee());
            expect(testee.async()).to.be.equal('Async');
        });

        it('should pass through methods returning anything else than a Promise', function()
        {
            const testee = synchronize(new Testee());
            expect(testee.sync()).to.be.equal('Sync');
        });

        it('should pass through property access', function()
        {
            const testee = synchronize(new Testee());
            expect(testee.property).to.be.equal('Testee');
            testee._property = 'Changed';
            expect(testee.property).to.be.equal('Changed');
        });
    });
});
