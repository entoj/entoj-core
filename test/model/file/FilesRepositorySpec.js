"use strict";

/**
 * Requirements
 */
const FilesRepository = require(SOURCE_ROOT + '/model/file/FilesRepository.js').FilesRepository;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const co = require('co');


/**
 * Spec
 */
describe(FilesRepository.className, function()
{
    /**
     * Base Test
     */
    baseSpec(FilesRepository, 'model.file/FilesRepository', function(parameters)
    {
        parameters.unshift(fixtures.entitiesRepository);
        return parameters;
    });


    /**
     * FilesRepository Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.siteBase = synchronize.execute(fixtures.sitesRepository, 'findBy', [Site.ANY, 'base']);
    });


    describe('#getBySite', function()
    {
        it('should return a promise', function()
        {
            const testee = new FilesRepository(fixtures.entitiesRepository);
            const promise = testee.getBySite();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to a array', function()
        {
            const promise = co(function *()
            {
                const testee = new FilesRepository(fixtures.entitiesRepository);
                const files = yield testee.getBySite();
                expect(files).to.be.instanceof(Array);
            });
            return promise;
        });

        it('should resolve to an array containing all files of the given site', function()
        {
            const promise = co(function *()
            {
                const testee = new FilesRepository(fixtures.entitiesRepository);
                const files = yield testee.getBySite(fixtures.siteBase);
                expect(files).to.be.instanceof(Array);
                expect(files.length).to.be.equal(23);
            });
            return promise;
        });

        it('should allow to apply a filter to the found files', function()
        {
            const promise = co(function *()
            {
                const testee = new FilesRepository(fixtures.entitiesRepository);
                const files = yield testee.getBySite(fixtures.siteBase, (file) => file.contentType == ContentType.SASS);
                expect(files).to.be.instanceof(Array);
                expect(files.length).to.be.equal(8);
            });
            return promise;
        });
    });


    describe('#getBySiteGrouped', function()
    {
        it('should return a promise', function()
        {
            const testee = new FilesRepository(fixtures.entitiesRepository);
            const promise = testee.getBySiteGrouped();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to a object', function()
        {
            const promise = co(function *()
            {
                const testee = new FilesRepository(fixtures.entitiesRepository);
                const files = yield testee.getBySiteGrouped();
                expect(files).to.be.ok;
            });
            return promise;
        });

        it('should resolve to an object containing all files of the given site grouped by the given property', function()
        {
            const promise = co(function *()
            {
                const testee = new FilesRepository(fixtures.entitiesRepository);
                const files = yield testee.getBySiteGrouped(fixtures.siteBase, false, 'groups.css', 'common');
                expect(files.common).to.be.instanceof(Array);
                expect(files.common).to.have.length(18);
                expect(files.core).to.be.instanceof(Array);
                expect(files.core).to.have.length(5);
            });
            return promise;
        });

        it('should allow to apply a filter to the found files', function()
        {
            const promise = co(function *()
            {
                const testee = new FilesRepository(fixtures.entitiesRepository);
                const files = yield testee.getBySiteGrouped(fixtures.siteBase, (file) => file.contentType == ContentType.SASS, 'groups.css', 'common');
                expect(files.common).to.be.instanceof(Array);
                expect(files.common).to.have.length(7);
                expect(files.core).to.be.instanceof(Array);
                expect(files.core).to.have.length(1);
            });
            return promise;
        });
    });
});
