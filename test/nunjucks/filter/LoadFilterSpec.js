"use strict";

/**
 * Requirements
 */
const LoadFilter = require(SOURCE_ROOT + '/nunjucks/filter/LoadFilter.js').LoadFilter;
const ViewModelRepository = require(SOURCE_ROOT + '/model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const baseFilterSpec = require(TEST_ROOT + '/nunjucks/filter/BaseFilterShared.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
const nunjucks = require('nunjucks');
const sinon = require('sinon');


/**
 * Spec
 */
describe(LoadFilter.className, function()
{
    /**
     * BaseFilter Test
     */
    baseFilterSpec(LoadFilter, 'nunjucks.filter/LoadFilter', function(parameters)
    {
        parameters.unshift(fixtures.viewModelRepository);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.viewModelRepository = fixtures.context.di.create(ViewModelRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.environment = new nunjucks.Environment();
    });


    /**
     * LoadFilter Test
     */
    describe('#filter', function()
    {
        it('should passthrough anything that is not a string', function()
        {
            const testee = new LoadFilter(fixtures.viewModelRepository);
            const loaded = testee.filter()({ hell: 'yeah' });
            expect(loaded.hell).to.be.equal('yeah');
        });

        it('should load a json file though ViewModelRepository', function()
        {
            sinon.spy(fixtures.viewModelRepository, 'getByPath');
            const testee = new LoadFilter(fixtures.viewModelRepository);
            const loaded = testee.filter()('e005-button/default');
            expect(fixtures.viewModelRepository.getByPath.calledOnce).to.be.ok;
            expect(loaded.name).to.be.equal('e005-button');
        });
    });
});
