"use strict";

/**
 * Requirements
 */
const BaseArray = require(SOURCE_ROOT + '/base/BaseArray.js').BaseArray;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Spec
 */
describe(BaseArray.className, function()
{
    /**
     * Base Test
     */
    baseSpec(BaseArray, 'base/BaseArray');


    /**
     * BaseArray Test
     */
    describe('#load', function()
    {
        it('should allow to import a Array', function()
        {
            const testee = new BaseArray();
            const data = ['foo', 'bar'];

            testee.load(data);
            expect(testee).to.include('foo');
            expect(testee).to.include('bar');
        });

        it('should preserve existing items', function()
        {
            const testee = new BaseArray();
            testee.push('bar');
            const data = ['foo'];

            testee.load(data);
            expect(testee).to.include('foo');
            expect(testee).to.include('bar');
        });

        it('should allow to clear items before loading', function()
        {
            const testee = new BaseArray();
            testee.push('bar');
            const data = ['foo'];

            testee.load(data, true);
            expect(testee).to.include('foo');
            expect(testee).to.not.include('bar');
        });

        it('should do nothing when given non iterable data', function()
        {
            const testee = new BaseArray();

            testee.load(undefined);
            expect(testee.length).to.be.equal(0);
        });
    });
});