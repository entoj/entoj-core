'use strict';

/**
 * Requirements
 */
let BaseValueObject = require(SOURCE_ROOT + '/model/BaseValueObject.js').BaseValueObject;
let baseValueObjectSpec = require('./BaseValueObjectShared.js').spec;


/**
 * Spec
 */
describe(BaseValueObject.className, function()
{
    baseValueObjectSpec(BaseValueObject, 'model/BaseValueObject');


    describe('#uniqueId', function()
    {
        it('should return the object instance per default', function()
        {
            let testee = new BaseValueObject();
            expect(testee.uniqueId).to.be.equal(testee);
        });
    });


    describe('#isEqualTo', function()
    {
        it('should return true when both objects are the same instance', function()
        {
            let testee = new BaseValueObject();
            expect(testee.isEqualTo(testee)).to.be.ok;
        });

        it('should return false when both objects are not the same instance', function()
        {
            let testee = new BaseValueObject();
            let other = new BaseValueObject();
            expect(testee.isEqualTo(other)).to.be.not.ok;
        });
    });
});