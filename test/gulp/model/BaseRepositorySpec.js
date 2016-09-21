"use strict";

/**
 * Requirements
 */
let BaseRepository = require(SOURCE_ROOT + '/gulp/model/BaseRepository.js').BaseRepository;
let EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
let SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
let PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
let ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
let File = require(SOURCE_ROOT + '/model/file/File.js').File;
let VinylFile = require('vinyl');
let MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
let compact = require(FIXTURES_ROOT + '/Application/Compact.js');
let baseSpec = require('../../BaseShared.js').spec;


/**
 * Spec
 */
describe(BaseRepository.className, function()
{
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


    baseSpec(BaseRepository, 'gulp.model/BaseRepository', function(parameters)
    {
        parameters.unshift(fixtures.pathesConfiguration);
        parameters.unshift(fixtures.entitiesRepository);
        return parameters;
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a entitiesRepository configuration', function()
        {
            expect(function() { new BaseRepository(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper entitiesRepository type', function()
        {
            expect(function() { new BaseRepository('Entities'); }).to.throw(TypeError);
        });

        it('should throw a exception when created without a pathesConfiguration configuration', function()
        {
            expect(function() { new BaseRepository(fixtures.entitiesRepository); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathesConfiguration type', function()
        {
            expect(function() { new BaseRepository(fixtures.entitiesRepository, 'Entities'); }).to.throw(TypeError);
        });
    });


    describe('#getGroupedFilesBySite()', function()
    {
        it('should resolve to an object containing grouped files', function()
        {
            let testee = new BaseRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            let promise = testee.getGroupedFilesBySite(fixtures.siteBase).then(function(files)
            {
                // Common
                expect(files.common).to.be.ok;
                expect(files.common.length).to.be.above(0);
            });
            return promise;
        });

        it('should allow to filter the returned files', function()
        {
            let testee = new BaseRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            let filter = file => file.contentType === ContentType.JS;
            let promise = testee.getGroupedFilesBySite(fixtures.siteBase, undefined, filter).then(function(files)
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
            let testee = new BaseRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            let filter = file => file.contentType === ContentType.JS;
            let promise = testee.getGroupedFilesBySite(fixtures.siteBase, 'js', filter).then(function(files)
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
});
