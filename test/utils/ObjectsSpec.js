"use strict";

/**
 * Requirements
 */
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const isPlainObject = require(SOURCE_ROOT + '/utils/objects.js').isPlainObject;
const isEmpty = require(SOURCE_ROOT + '/utils/objects.js').isEmpty;


/**
 * Spec
 */
describe('utils/objects', function()
{
    class Testee
    {
        constructor()
        {
            this.parameters = Array.from(arguments);
        }
    }


    describe('#create', function()
    {
        it('should allow to create a object with no arguments', function()
        {
            const testee = create(Testee);
            expect(testee.parameters).to.have.length(0);
        });


        it('should allow to create a object with one argument', function()
        {
            const testee = create(Testee, ['one']);
            expect(testee.parameters).to.have.length(1);
            expect(testee.parameters).to.contain('one');
        });

        it('should allow to create a object with many argument', function()
        {
            const testee = create(Testee, ['one', 'two', 'three', 'four']);
            expect(testee.parameters).to.have.length(4);
            expect(testee.parameters).to.contain('one');
            expect(testee.parameters).to.contain('two');
            expect(testee.parameters).to.contain('three');
            expect(testee.parameters).to.contain('four');
        });
    });


    describe('#isPlainObject', function()
    {
        it('should recognize a object literal or a new Object()', function()
        {
            expect(isPlainObject({})).to.be.ok;
            expect(isPlainObject(new Object())).to.be.ok;
        });

        it('should not recognize a Class instance', function()
        {
            expect(isPlainObject(new Testee())).to.be.not.ok;
        });

        it('should not recognize primitives', function()
        {
            expect(isPlainObject(false)).to.be.not.ok;
            expect(isPlainObject(null)).to.be.not.ok;
            expect(isPlainObject(undefined)).to.be.not.ok;
            expect(isPlainObject('42')).to.be.not.ok;
            expect(isPlainObject(42)).to.be.not.ok;
        });

        it('should not recognize built in objects', function()
        {
            expect(isPlainObject(new Date())).to.be.not.ok;
            expect(isPlainObject(new RegExp())).to.be.not.ok;
        });
    });


    describe('#isEmpty()', function()
    {
        it('should recognize falsy values', function()
        {
            expect(isEmpty()).to.be.ok;
            expect(isEmpty(false)).to.be.ok;
            expect(isEmpty(null)).to.be.ok;
            expect(isEmpty('')).to.be.ok;
        });


        it('should not recognize non falsy values', function()
        {
            expect(isEmpty(true)).to.be.not.ok;
            expect(isEmpty('Hi')).to.be.not.ok;
            expect(isEmpty(1)).to.be.not.ok;
            expect(isEmpty(0)).to.be.not.ok;
        });


        it('should recognize empty arrays or maps', function()
        {
            expect(isEmpty([])).to.be.ok;
            expect(isEmpty(new Map())).to.be.ok;
            expect(isEmpty({})).to.be.ok;
        });
    });
});
