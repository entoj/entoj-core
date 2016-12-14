'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const urlrewrite = require('postcss-urlrewrite');
const doiuse = require('doiuse');


/**
 * @memberOf task
 */
class PostprocessCssTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/PostprocessCssTask';
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        if (!buildConfiguration)
        {
            this._cliLogger.error(this.className + ' - Missing build configuration');
        }

        if (!stream || !buildConfiguration)
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        // Disable gulp logging
        gutil.log = function()
        {
            return this;
        };

        // Prepare
        const scope = this;
        let resultStream = stream;
        const browsers = buildConfiguration.get('sass.browsers', ['ie >= 9', '> 2%']);
        const sourceMaps = buildConfiguration.get('sass.sourceMaps', false);
        const optimize = buildConfiguration.get('sass.optimize', false);
        const minimize = buildConfiguration.get('sass.minimize', false);
        const check = buildConfiguration.get('sass.check', false);
        const urlRewrite = buildConfiguration.get('sass.urlRewrite', false);

        // Show config
        const work = this._cliLogger.section('Postprocessing css files');
        this._cliLogger.options(
            {
                environment: buildConfiguration.environment,
                browsers: browsers,
                sourceMaps: sourceMaps,
                urlRewrite: urlRewrite,
                optimize: optimize,
                minimize: minimize,
                check: check
            });

        // Prepare postcss
        const postcssProcessors = [];
        try
        {
            if (urlRewrite !== false)
            {
                postcssProcessors.push(urlrewrite(
                    {
                        properties: ['background', 'src', 'background-image'],
                        rules: urlRewrite
                    }));
            }
            if (check === true)
            {
                postcssProcessors.push(doiuse(
                    {
                        browsers: browsers,
                        onFeatureUsage: function(usageInfo)
                        {
                            scope._cliLogger.error(usageInfo.message);
                        }
                    }));
            }
            postcssProcessors.push(cssnext(
                {
                    browsers: browsers,
                    warnForDuplicates: false
                }));
            if (optimize === true)
            {
                postcssProcessors.push(mqpacker());
            }
            if (minimize === true)
            {
                postcssProcessors.push(cssnano());
            }
        }
        catch(e)
        {
            /* istanbul ignore next */
            scope._cliLogger.error(e);
        }

        // Run postcss & sourcemaps
        if (sourceMaps === true)
        {
            resultStream = resultStream.pipe(sourcemaps.init());
        }
        resultStream = resultStream.pipe(postcss(postcssProcessors));
        if (sourceMaps === true)
        {
            resultStream = resultStream.pipe(sourcemaps.write());
        }

        // Wait for stream
        resultStream.on('finish', () =>
        {
            this._cliLogger.end(work);
        });

        return resultStream;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.PostprocessCssTask = PostprocessCssTask;
