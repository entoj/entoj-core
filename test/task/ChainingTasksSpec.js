"use strict";

/**
 * Requirements
 */
const CompileSassTask = require(SOURCE_ROOT + '/task/CompileSassTask.js').CompileSassTask;
const DecorateTask = require(SOURCE_ROOT + '/task/DecorateTask.js').DecorateTask;
const PostprocessCssTask = require(SOURCE_ROOT + '/task/PostprocessCssTask.js').PostprocessCssTask;
const WriteFilesTask = require(SOURCE_ROOT + '/task/WriteFilesTask.js').WriteFilesTask;
const FilesRepository = require(SOURCE_ROOT + '/model/file/FilesRepository.js').FilesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require(SOURCE_ROOT + '/model/configuration/BuildConfiguration.js').BuildConfiguration;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const co = require('co');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const sinon = require('sinon');



/**
 * Spec
 */
describe('task/ChainingTasks', function()
{
    /**
     * Test
     */
    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = fixtures.context.di.create(CliLogger);
        fixtures.cliLogger.muted = true;
        fixtures.filesRepository = fixtures.context.di.create(FilesRepository);
        fixtures.sitesRepository = fixtures.context.di.create(SitesRepository);
        fixtures.pathesConfiguration = fixtures.context.di.create(PathesConfiguration);
        fixtures.buildConfiguration = fixtures.context.di.create(BuildConfiguration);
        fixtures.buildConfiguration.environment = 'production';
        fixtures.path = pathes.concat(FIXTURES_ROOT, '/Tasks/ChainingTasks');
        fs.emptyDirSync(fixtures.path);
    });


    describe('#run()', function()
    {
        it('yesyo', function()
        {
            const compileSassTask = new CompileSassTask(fixtures.cliLogger, fixtures.filesRepository, fixtures.sitesRepository, fixtures.pathesConfiguration);
            return compileSassTask
                .pipe(new PostprocessCssTask(fixtures.cliLogger))
                .pipe(new DecorateTask(fixtures.cliLogger, '/* Decorated */'))
                .pipe(new WriteFilesTask(fixtures.cliLogger))
                .run(fixtures.buildConfiguration, { path: fixtures.path });
        });
    });
});
