"use strict";

/**
 * Requirements
 */
const BuildConfiguration = require(SOURCE_ROOT + '/model/configuration/BuildConfiguration.js').BuildConfiguration;


/**
 * Spec
 */
describe(BuildConfiguration.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
        fixtures.build = {};
        fixtures.build.default = 'development';
        fixtures.build.environments = {};
        fixtures.build.environments.development =
        {
            sass:
            {
                sourceMaps: true,
                comments: false,
                optimize: false,
                minimize: false
            }
        };
        fixtures.build.environments.production =
        {
            sass:
            {
                sourceMaps: false,
                comments: false,
                optimize: false,
                minimize: false
            }
        };
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new BuildConfiguration();
            expect(testee.className).to.be.equal('model.configuration/BuildConfiguration');
        });
    });


    describe('#get()', function()
    {
        it('should allow to query values via their pathes', function()
        {
            let testee = new BuildConfiguration(fixtures.build);
            expect(testee.get('sass.sourceMaps')).to.be.equal(true);
        });


        it('should allow to specify a default value', function()
        {
            let testee = new BuildConfiguration(fixtures.build);
            expect(testee.get('sass.unconfigured', 'default')).to.be.equal('default');
        });


        it('should allow to switch the environment', function()
        {
            let testee = new BuildConfiguration(fixtures.build);
            testee.environment = 'production';
            expect(testee.get('sass.sourceMaps')).to.be.equal(false);
        });
    });

});