"use strict";

/**
 * Requirements
 */
let GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
let baseSpec = require('../../BaseShared.js').spec;


/**
 * Spec
 */
describe(GlobalConfiguration.className, function()
{
    baseSpec(GlobalConfiguration, 'model.configuration/GlobalConfiguration');


    beforeEach(function()
    {
        fixtures = {};
        fixtures.global =
        {
            groups:
            {
                default: 'core'
            }
        };
    });


    describe('#get()', function()
    {
        it('should have default values for all settings', function()
        {
            let testee = new GlobalConfiguration();
            expect(testee.get('groups.default')).to.be.equal('common');
        });

        it('should allow to configure settings', function()
        {
            let testee = new GlobalConfiguration(fixtures.global);
            expect(testee.get('groups.default')).to.be.equal('core');
        });


        it('should throw an error for unknown settings', function()
        {
            let testee = new GlobalConfiguration();
            expect(function() { testee.get('foo'); }).to.throw();
        });
    });
});
