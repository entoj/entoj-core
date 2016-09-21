"use strict";

/**
 * Requirements
 */
const BaseArray = require(SOURCE_ROOT + '/base/BaseArray.js').BaseArray;
let baseSpec = require('../BaseShared.js').spec;


/**
 * Spec
 */
describe(BaseArray.className, function()
{
    baseSpec(BaseArray, 'base/BaseArray');

    describe('#load', function()
    {
        it('should allow to import a Array', function()
        {
            let testee = new BaseArray();
            let data = ['foo', 'bar'];

            testee.load(data);
            expect(testee).to.include('foo');
            expect(testee).to.include('bar');
        });

        it('should preserve existing items', function()
        {
            let testee = new BaseArray();
            testee.push('bar');
            let data = ['foo'];

            testee.load(data);
            expect(testee).to.include('foo');
            expect(testee).to.include('bar');
        });

        it('should allow to clear items before loading', function()
        {
            let testee = new BaseArray();
            testee.push('bar');
            let data = ['foo'];

            testee.load(data, true);
            expect(testee).to.include('foo');
            expect(testee).to.not.include('bar');
        });

        it('should do nothing when given non iterable data', function()
        {
            let testee = new BaseArray();

            testee.load(undefined);
            expect(testee.length).to.be.equal(0);
        });
    });
});
