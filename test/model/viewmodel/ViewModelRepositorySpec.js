"use strict";

/**
 * Requirements
 */
const ViewModelRepository = require(SOURCE_ROOT + '/model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const ViewModel = require(SOURCE_ROOT + '/model/viewmodel/ViewModel.js').ViewModel;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js');
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const co = require('co');


/**
 * Spec
 */
describe(ViewModelRepository.className, function()
{
    /**
     * Base Test
     */
    baseSpec(ViewModelRepository, 'model.viewmodel/ViewModelRepository', function(parameters)
    {
        parameters.unshift(fixtures.pathesConfiguration);
        parameters.unshift(fixtures.entitiesRepository);
        return parameters;
    });


    /**
     * ViewModelRepository Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.entitiesRepository = fixtures.context.di.create(EntitiesRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.siteBase = synchronize.execute(fixtures.sitesRepository, 'findBy', [Site.ANY, 'base']);
        fixtures.siteExtended = synchronize.execute(fixtures.sitesRepository, 'findBy', [Site.ANY, 'extended']);
    });


    describe('#getByPath', function()
    {
        it('should return a promise', function()
        {
            const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
            const promise = testee.getByPath();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to a ViewModel when a full path to a json was given', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath('base/elements/e005-button/models/default.json');
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data.name).to.be.equal('e005-button');
            });
            return promise;
        });

        it('should resolve to a ViewModel with no data when a invalid path to a json was given', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath(':base/elements/e005-button/models/default.json');
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to a ViewModel when a short path in the from entity/model was given', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath('e005-button/default');
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data.name).to.be.equal('e005-button');
            });
            return promise;
        });

        it('should allow extended sites to override models ', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath('e005-button/default', fixtures.siteExtended);
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data.name).to.be.equal('e005-button-extended');
            });
            return promise;
        });

        it('should allow extended sites to use models from its parent', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath('e005-button/cta', fixtures.siteExtended);
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data.name).to.be.equal('e005-button-cta');
            });
            return promise;
        });

        it('should allow to use the @lipsum macro in model properties', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath('base/elements/e005-button/models/lipsum.json');
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data.copy).to.not.contain('@lipsum');
                expect(viewModel.data.intro.headline).to.not.contain('@lipsum');
                expect(viewModel.data.intro.headline).to.have.length.above(1);
                expect(viewModel.data.items[0].name).to.not.contain('@lipsum');
                expect(viewModel.data.items[0].name).to.have.length.above(1);
            });
            return promise;
        });

        it('should allow to use the @lipsum-html macro in model properties', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath('base/elements/e005-button/models/lipsum-html.json');
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data.copy).to.not.contain('@lipsum-html');
                console.log(viewModel.data);
            });
            return promise;
        });

        it('should allow to use the @include macro in model properties', function()
        {
            const promise = co(function *()
            {
                const testee = new ViewModelRepository(fixtures.entitiesRepository, fixtures.pathesConfiguration);
                const viewModel = yield testee.getByPath('base/elements/e005-button/models/include.json');
                expect(viewModel).to.be.instanceof(ViewModel);
                expect(viewModel.data.default.name).to.be.equal('e005-button');
                expect(viewModel.data.lipsum.copy).to.not.contain('@lipsum');
            });
            return promise;
        });
    });
});
