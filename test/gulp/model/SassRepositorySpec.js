"use strict";

/**
 * Requirements
 */
const SassRepository = require(SOURCE_ROOT + '/gulp/model/SassRepository.js').SassRepository;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const File = require(SOURCE_ROOT + '/model/file/File.js').File;
const VinylFile = require('vinyl');
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const PATH_SEPERATOR = require('path').sep;


/**
 * Spec
 */
describe(SassRepository.className, function()
{
    beforeEach(function(done)
    {
        fixtures = compact.createFixture();

        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.siteBase = false;
        fixtures.siteExtended = false;

        fixtures.sitesRepository.findBy('name', 'base').then(function(site)
        {
            fixtures.siteBase = site;
            fixtures.sitesRepository.findBy('name', 'extended').then(function(site)
            {
                fixtures.siteExtended = site;
                done();
            });
        });
    });


    describe('#constructor()', function()
    {
        it('should throw a exception when created without a entitiesRepository configuration', function()
        {
            expect(function() { new SassRepository(); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper entitiesRepository type', function()
        {
            expect(function() { new SassRepository('Entities'); }).to.throw(TypeError);
        });

        it('should throw a exception when created without a pathesConfiguration configuration', function()
        {
            expect(function() { new SassRepository(fixtures.entitiesRepository); }).to.throw(MissingArgumentError);
        });

        it('should throw a exception when created without a proper pathesConfiguration type', function()
        {
            expect(function() { new SassRepository(fixtures.entitiesRepository, 'Entities'); }).to.throw(TypeError);
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new SassRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            expect(testee.className).to.be.equal('gulp.model/SassRepository');
        });
    });


    describe('#getFilesBySite()', function()
    {
        it('should resolve to an object containing all files for each group', function()
        {
            const testee = new SassRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getFilesBySite(fixtures.siteBase).then(function(files)
            {
                // Common
                expect(files.common).to.be.ok;
                expect(files.common.length).to.be.above(0);

                // Core
                expect(files.core).to.be.ok;
                expect(files.core.length).to.be.above(0);
            });
            return promise;
        });

        it('should ignore files that are prefixed with _', function()
        {
            const testee = new SassRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getFilesBySite(fixtures.siteBase).then(function(files)
            {
                // Common
                expect(files.common).to.have.length(2);
                expect(files.common.find(file => file.basename == 'index.scss')).to.be.ok;
                expect(files.common.find(file => file.basename == 'e005-button.scss')).to.be.ok;

                // Core
                expect(files.core).to.have.length(1);
                expect(files.core.find(file => file.basename == 'm001-gallery.scss')).to.be.ok;
            });
            return promise;
        });

        it('should resolve to an object containing all files for a extended site', function()
        {
            const testee = new SassRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getFilesBySite(fixtures.siteExtended).then(function(files)
            {
                // Common
                expect(files.common).to.be.ok;
                expect(files.common.length).to.be.above(0);

                // Core
                expect(files.core).to.be.ok;
                expect(files.core.length).to.be.above(0);
            });
            return promise;
        });
    });


    describe('#getBySite()', function()
    {
        it('should resolve to an object containing a file for each group that contains all necessary imports', function()
        {
            const testee = new SassRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getBySite(fixtures.siteBase).then(function(files)
            {
                // Common
                expect(VinylFile.isVinyl(files.common)).to.be.ok;
                expect(files.common.contents.toString()).to.contain('/index.scss');
                expect(files.common.contents.toString()).to.contain('/e005-button.scss');

                // Core
                expect(VinylFile.isVinyl(files.core)).to.be.ok;
                expect(files.core.contents.toString()).to.contain('/m001-gallery.scss');
            });
            return promise;
        });

        it('should normalize pathes to be absolute starting at the sites root', function()
        {
            const testee = new SassRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getBySite(fixtures.siteBase).then(function(files)
            {
                // Common
                expect(VinylFile.isVinyl(files.common)).to.be.ok;
                expect(files.common.contents.toString()).to.contain("@import 'base/common/sass/index.scss';");
            });
            return promise;
        });

        it('should resolve to an object containing a file for each group that contains all necessary imports including their parents', function()
        {
            const testee = new SassRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getBySite(fixtures.siteExtended).then(function(files)
            {
                // Common
                expect(VinylFile.isVinyl(files.common)).to.be.ok;
                expect(files.common.contents.toString()).to.contain('base/common/sass/index.scss');
                expect(files.common.contents.toString()).to.contain('extended/common/sass/index.scss');
                expect(files.common.contents.toString()).to.contain('base/elements/e005-button/sass/e005-button.scss');

                // Core
                expect(VinylFile.isVinyl(files.core)).to.be.ok;
                expect(files.core.contents.toString()).to.contain('base/modules/m001-gallery/sass/m001-gallery.scss');
                expect(files.core.contents.toString()).to.contain('extended/modules/m001-gallery/sass/m001-gallery.scss');
            });
            return promise;
        });
    });
});
