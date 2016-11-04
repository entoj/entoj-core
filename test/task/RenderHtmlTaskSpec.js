"use strict";

/**
 * Requirements
 */
const RenderHtmlTask = require(SOURCE_ROOT + '/task/RenderHtmlTask.js').RenderHtmlTask;
const GlobalRepository = require(SOURCE_ROOT + '/model/GlobalRepository.js').GlobalRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const Environment = require(SOURCE_ROOT + '/nunjucks/Environment.js').Environment;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const sinon = require('sinon');
const PATH_SEPERATOR = require('path').sep;


/**
 * Spec
 */
describe(RenderHtmlTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(RenderHtmlTask, 'task/RenderHtmlTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.nunjucks);
        parameters.unshift(fixtures.pathesConfiguration);
        parameters.unshift(fixtures.globalRepository);
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     */
    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(RenderHtmlTask, parameters);
    };


    /**
     * RenderHtmlTask Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = fixtures.context.di.create(CliLogger);
        fixtures.cliLogger.muted = true;
        fixtures.globalRepository = fixtures.context.di.create(GlobalRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.nunjucks = fixtures.context.di.create(Environment);
    });


    describe('#renderEntity()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.renderEntity();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should yield a rendered VinylFile', function()
        {
            const promise = co(function *()
            {
                const testee = createTestee();
                const entities = yield fixtures.globalRepository.resolveEntities('base/modules/m001-gallery');
                const file = yield testee.renderEntity(entities[0]);
                expect(file).to.be.instanceof(VinylFile);
                expect(file.contents.toString()).to.be.contain('<%@ include');
            });
            return promise;
        });
    });
});
