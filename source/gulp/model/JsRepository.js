'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRepository = require('./BaseRepository.js').BaseRepository;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const ContentType = require('../../model/ContentType.js');
const difference = require('lodash.difference');
const co = require('co');
const PATH_SEPERATOR = require('path').sep;


/**
 * @class
 * @memberOf gulp.model
 * @extends {Base}
 */
class JsRepository extends BaseRepository
{
    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, PathesConfiguration, 'gulp.model/JsRepository.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'gulp.model/JsRepository';
    }


    /**
     * @param {Site} site
     * @returns {Promise.<Array>}
     */
    getBundlesBySite(site)
    {
        const scope = this;
        const promise = co(function *()
        {
            const files = yield scope.getGroupedFilesBySite(site, 'js', file => file.contentType === ContentType.JS);

            // Collect all modules
            const all = [];
            for (const group in files)
            {
                for (const file of files[group])
                {
                    all.push(file.filename.replace(scope._pathesConfiguration.sites + PATH_SEPERATOR, ''));
                }
            }

            // Create bundles
            const bundles = {};
            for (const group in files)
            {
                const bundle =
                {
                    filename : site.name.toLowerCase() + PATH_SEPERATOR + group.toLowerCase() + '.js',
                    prepend: [],
                    append: [],
                    include: [],
                    exclude: []
                };

                // Add include
                for (const file of files[group])
                {
                    const url = file.filename.replace(scope._pathesConfiguration.sites + PATH_SEPERATOR, '');
                    bundle.include.push(url);
                }

                // Generate exclude
                bundle.exclude = difference(all, bundle.include);

                // Add jspm when default category
                if (group === scope._defaultGroup)
                {
                    bundle.prepend.push(scope._pathesConfiguration.entoj + PATH_SEPERATOR + 'jspm_packages' + PATH_SEPERATOR + 'system-polyfills.js');
                    bundle.prepend.push(scope._pathesConfiguration.entoj + PATH_SEPERATOR + 'jspm_packages' + PATH_SEPERATOR + 'system.src.js');
                    bundle.prepend.push(scope._pathesConfiguration.entoj + PATH_SEPERATOR + 'jspm.js');
                }

                // Add bundle
                bundles[group] = bundle;
            }

            return bundles;
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.JsRepository = JsRepository;
