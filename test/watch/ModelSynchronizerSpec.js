"use strict";

/**
 * Requirements
 */
let ModelSynchronizer = require(SOURCE_ROOT + '/watch/ModelSynchronizer.js').ModelSynchronizer;
let FileWatcher = require(SOURCE_ROOT + '/watch/FileWatcher.js').FileWatcher;
let CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
let baseSpec = require('../BaseShared.js').spec;
let compact = require(FIXTURES_ROOT + '/Watch/Compact.js');
let co = require('co');
let sinon = require('sinon');
let delay = require('lodash.delay');


/**
 * Spec
 */
describe(ModelSynchronizer.className, function()
{
    baseSpec(ModelSynchronizer, 'watch/ModelSynchronizer', function(parameters)
    {
        parameters.unshift(fixtures.cliLogger, fixtures.fileWatcher, fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = new CliLogger('', { muted: true });
        fixtures.fileWatcher = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser, { debounce: 50 });
        fixtures.reset();
    });


    describe('#processChanges', function()
    {
        it('should invalidate sites and entities when given a site change', function()
        {
            let promise = co(function *()
            {
                let testee = new ModelSynchronizer(fixtures.cliLogger, fixtures.fileWatcher, fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
                let input =
                {
                    site:
                    {
                        add:
                        [
                            '/foo',
                            '/baz'
                        ],
                        remove:
                        [
                            '/bar'
                        ]
                    }
                };
                let sitesInvalidate = sinon.spy(fixtures.sitesRepository, 'invalidate');
                let entitiesInvalidate = sinon.spy(fixtures.entitiesRepository, 'invalidate');
                yield testee.processChanges(input);
                expect(sitesInvalidate.calledOnce).to.be.ok;
                expect(entitiesInvalidate.calledOnce).to.be.ok;
            });
            return promise;
        });

        it('should invalidate specific entities when given a entity change', function()
        {
            let promise = co(function *()
            {
                let testee = new ModelSynchronizer(fixtures.cliLogger, fixtures.fileWatcher, fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
                let input =
                {
                    entity:
                    {
                        add:
                        [
                            '/default/modules/m002-test'
                        ],
                        remove:
                        [
                            '/default/modules/m001-gallery'
                        ]
                    }
                };
                let entitiesInvalidate = sinon.spy(fixtures.entitiesRepository, 'invalidate');
                yield testee.processChanges(input);
                expect(entitiesInvalidate.calledOnce).to.be.ok;
                expect(entitiesInvalidate.calledWith(input.entity)).to.be.ok;
            });
            return promise;
        });
    });


    xdescribe('#start', function()
    {
        it('should watch files and dispatch a invalidated signal', function(cb)
        {
            this.timeout(5000);
            let testee = new ModelSynchronizer(fixtures.cliLogger, fixtures.fileWatcher, fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            testee.signals.invalidated.add(function(synchronizer, invalidations)
            {
                testee.stop();
                cb();
            });
            testee.start().then(function()
            {
                fixtures.copy('/default/modules/m001-gallery');
            });
        });

        it('should dispatch a object that describes all invalidations', function(cb)
        {
            this.timeout(5000);
            let testee = new ModelSynchronizer(fixtures.cliLogger, fixtures.fileWatcher, fixtures.sitesRepository, fixtures.categoriesRepository, fixtures.entitiesRepository);
            testee.signals.invalidated.add(function(synchronizer, invalidations)
            {
                testee.stop();
                expect(invalidations).to.be.ok;
                expect(invalidations.entity).to.be.ok;
                expect(invalidations.entity.add).to.be.ok;
                expect(invalidations.entity.add).to.have.length(1);
                expect(invalidations.files).to.be.ok;
                expect(invalidations.files.length).to.be.equal(19);
                expect(invalidations.sites).to.be.ok;
                expect(invalidations.sites).to.have.length(1);
                cb();
            });
            testee.start().then(function()
            {
                fixtures.copy('/default/modules/m001-gallery');
            });
        });
    });
});
