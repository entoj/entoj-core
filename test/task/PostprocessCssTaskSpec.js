"use strict";

/**
 * Requirements
 */
const PostprocessCssTask = require(SOURCE_ROOT + '/task/PostprocessCssTask.js').PostprocessCssTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const BuildConfiguration = require(SOURCE_ROOT + '/model/configuration/BuildConfiguration.js').BuildConfiguration;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');
const pathes = require(SOURCE_ROOT + '/utils/pathes.js');
const doiuse = require('doiuse');
const co = require('co');
const through2 = require('through2');
const VinylFile = require('vinyl');
const fs = require('fs-extra');
const sinon = require('sinon');


/**
 * Spec
 */
describe(PostprocessCssTask.className, function()
{
    /**
     * BaseTask Test
     */
    baseTaskSpec(PostprocessCssTask, 'task/PostprocessCssTask', prepareParameters);

    /**
     */
    function prepareParameters(parameters)
    {
        parameters.unshift(fixtures.cliLogger);
        return parameters;
    };


    /**
     * Reduces a postcss plugin list to a simple array of names
     */
    function preparePluginList(list)
    {
        const result = [];
        for (let index = 0; index < list.length; index++)
        {
            if (list[index].postcssPlugin)
            {
                result.push(list[index].postcssPlugin);
            }
            else
            {
                const source = list[index].toString();
                if (source.indexOf('only partially supported by') > -1)
                {
                    result.push('doiuse');
                }
                else if (source.indexOf('if ( config.imports    ) { style.walkAtRules( updateImport ); }') > -1)
                {
                    result.push('urlrewrite');
                }
                else
                {
                    console.log('Not found', source);
                }
            }
        }
        return result;
    }


    /**
     * Creates a sass build configuration
     */
    function prepareBuildSettings(options)
    {
        const opts =
        {
            environments:
            {
                development:
                {
                    sass: options
                }
            }
        };
        return new BuildConfiguration(opts);
    }


    /**
     * Tests if the given plugins where used on all files
     */
    function testPostCSSPlugins(options, plugins)
    {
        const promise = co(function *()
        {
            const testee = new PostprocessCssTask(fixtures.cliLogger);
            const data = yield baseTaskSpec.readStream(testee.stream(fixtures.sourceStream, prepareBuildSettings(options)));
            for (const file of data)
            {
                const postcssPlugins = preparePluginList(file.postcssPlugins);
                for (const plugin of plugins)
                {
                    expect(postcssPlugins).to.contain(plugin);
                }
            }
        });
        return promise;
    }


    /**
     * PostprocessCssTask Test
     */
    beforeEach(function()
    {
        fixtures.cliLogger = new CliLogger();
        fixtures.cliLogger.muted = true;
        fixtures.buildConfiguration = new BuildConfiguration();
        const sourceStream = through2(
        {
            objectMode: true
        });
        sourceStream.write(new VinylFile(
        {
            path: 'test.css',
            contents: new Buffer('/* test */')
        }));
        sourceStream.end();
        fixtures.sourceStream = sourceStream;
    });


    describe('#stream()', function()
    {
        it('should apply cssnext to all files', function()
        {
            return testPostCSSPlugins({}, ['autoprefixer', 'postcss-selector-not']);
        });

        it('should apply doiuse to all files when build configuration check == true', function()
        {
            return testPostCSSPlugins({ check: true }, ['doiuse']);
        });

        it('should apply urlRewrite to all files when build configuration urlRewrite != false', function()
        {
            return testPostCSSPlugins({ urlRewrite: [{ from: /\/base\//, to: '../' }] }, ['urlrewrite']);
        });

        it('should apply mqpacker to all files when build configuration optimize == true', function()
        {
            return testPostCSSPlugins({ optimize: true }, ['css-mqpacker']);
        });

        it('should apply cssnano to all files when build configuration minimize == true', function()
        {
            return testPostCSSPlugins({ minimize: true }, ['cssnano-core']);
        });

        it('should inline source maps in all files when build configuration sourceMaps == true', function()
        {
            const promise = co(function *()
            {
                const testee = new PostprocessCssTask(fixtures.cliLogger);
                const data = yield baseTaskSpec.readStream(testee.stream(fixtures.sourceStream, prepareBuildSettings({ sourceMaps: true })));
                for (const file of data)
                {
                    expect(file.contents.toString()).to.contain('/*# sourceMappingURL=');
                }
            });
            return promise;
        });
    });
});
