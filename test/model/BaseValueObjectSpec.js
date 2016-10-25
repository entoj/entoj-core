'use strict';

/**
 * Requirements
 */
const BaseValueObject = require(SOURCE_ROOT + '/model/BaseValueObject.js').BaseValueObject;
const baseValueObjectSpec = require('./BaseValueObjectShared.js');


/**
 * Spec
 */
describe(BaseValueObject.className, function()
{
    /**
     * BaseValueObject Test
     */
    baseValueObjectSpec(BaseValueObject, 'model/BaseValueObject');


    /**
     * BaseValueObject Local Test
     */
    describe('#uniqueId', function()
    {
        it('should return the object instance per default', function()
        {
            const testee = new BaseValueObject();
            expect(testee.uniqueId).to.be.equal(testee);
        });
    });


    describe('#isEqualTo', function()
    {
        it('should return true when both objects are equal', function()
        {
            const testee = new BaseValueObject();
            expect(testee.isEqualTo(testee)).to.be.ok;
        });

        it('should return false when both objects are not the same instance', function()
        {
            const testee = new BaseValueObject();
            const other = new BaseValueObject();
            expect(testee.isEqualTo(other)).to.be.not.ok;
        });
    });

});
