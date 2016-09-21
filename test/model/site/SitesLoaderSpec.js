"use strict";

/**
 * Requirements
 */
let SitesLoader = require(SOURCE_ROOT + '/model/site/SitesLoader.js').SitesLoader;
let PackagePlugin = require(SOURCE_ROOT + '/model/loader/documentation/PackagePlugin.js').PackagePlugin;
let PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
let MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
let baseLoaderSpec = require('../BaseLoaderShared.js').spec;
let co = require('co');
let compact = require(FIXTURES_ROOT + '/Application/Compact.js');


/**
 * Spec
 */
describe(SitesLoader.className, function()
{
    baseLoaderSpec(SitesLoader, 'model.site/SitesLoader', function(parameters)
    {
        fixtures = compact.createFixture();
        parameters.unshift(fixtures.context.di.create(PathesConfiguration));
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a proper pathesConfiguration', function()
        {
            expect(function() { new SitesLoader(); }).to.throw(MissingArgumentError);
            expect(function() { new SitesLoader('Pathes'); }).to.throw(TypeError);
        });
    });


    describe('#load', function()
    {
        it('should resolve to Site instances extracted from the given directory structure', function()
        {
            let testee = new SitesLoader(fixtures.context.di.create(PathesConfiguration));
            let promise = co(function *()
            {
                const items = yield testee.load();
                expect(items.length).to.be.equal(2);
                expect(items[0].name).to.be.equal('Base');
                expect(items[1].name).to.be.equal('Extended');
            });
            return promise;
        });

        it('should allow to extend a Site via the extends property in package.json', function()
        {
            let testee = new SitesLoader(fixtures.context.di.create(PathesConfiguration), [fixtures.context.di.create(PackagePlugin)]);
            let promise = co(function *()
            {
                const items = yield testee.load();
                expect(items.length).to.be.equal(2);
                expect(items[0].name).to.be.equal('Base');
                expect(items[1].name).to.be.equal('Extended');
                expect(items[1].extends).to.be.equal(items[0]);
            });
            return promise;
        });
    });
});
