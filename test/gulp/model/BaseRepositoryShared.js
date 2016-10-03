"use strict";

/**
 * Requirements
 * @ignore
 */
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const File = require(SOURCE_ROOT + '/model/file/File.js').File;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const VinylFile = require('vinyl');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Shared BaseRepository spec
 */
function spec(type, className, prepareParameters)
{
    /**
     * Base Test
     */
    baseSpec(type, className, prepareParameters || function(parameters)
    {
        parameters.unshift(fixtures.pathesConfiguration);
        parameters.unshift(fixtures.entitiesRepository);
        return parameters;
    });


    /**
     * BaseRepository Test
     */
    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    /**
     * BaseRepository Test
     */
    beforeEach(function(done)
    {
        fixtures = compact.createFixture();

        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.siteBase = false;

        fixtures.sitesRepository.findBy('name', 'base').then(function(site)
        {
            fixtures.siteBase = site;
            done();
        });
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a entitiesRepository configuration', function()
        {
            expect(function() { createTestee(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper entitiesRepository type', function()
        {
            expect(function() { createTestee('Entities'); }).to.throw(TypeError);
        });

        it('should throw a exception when created without a pathesConfiguration configuration', function()
        {
            expect(function() { createTestee(fixtures.entitiesRepository); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathesConfiguration type', function()
        {
            expect(function() { createTestee(fixtures.entitiesRepository, 'Entities'); }).to.throw(TypeError);
        });
    });


    describe('#getGroupedFilesBySite()', function()
    {
        it('should resolve to an object containing grouped files', function()
        {
            const testee = createTestee(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getGroupedFilesBySite(fixtures.siteBase).then(function(files)
            {
                // Common
                expect(files.common).to.be.ok;
                expect(files.common.length).to.be.above(0);
            });
            return promise;
        });

        it('should allow to filter the returned files', function()
        {
            const testee = createTestee(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const filter = file => file.contentType === ContentType.JS;
            const promise = testee.getGroupedFilesBySite(fixtures.siteBase, undefined, filter).then(function(files)
            {
                // Common
                expect(files.common).to.be.ok;
                expect(files.common.length).to.be.equal(2);

                // Files
                expect(files.common.find(file => file.basename == 'bootstrap.js')).to.be.ok;
                expect(files.common.find(file => file.basename == 'm001-gallery.js')).to.be.ok;
            });
            return promise;
        });

        it('should allow to specify a property that will be used as the group', function()
        {
            const testee = createTestee(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const filter = file => file.contentType === ContentType.JS;
            const promise = testee.getGroupedFilesBySite(fixtures.siteBase, 'js', filter).then(function(files)
            {
                // Common
                expect(files.common).to.be.ok;
                expect(files.common.length).to.be.equal(1);
                expect(files.common.find(file => file.basename == 'bootstrap.js')).to.be.ok;

                // Core
                expect(files.core).to.be.ok;
                expect(files.core.length).to.be.equal(1);
                expect(files.core.find(file => file.basename == 'm001-gallery.js')).to.be.ok;
            });
            return promise;
        });
    });
}

/**
 * Exports
 */
module.exports = spec;
