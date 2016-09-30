'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const ContentType = require('../../model/ContentType.js');
const assertParameter = require('../../utils/assert.js').assertParameter;
const trimLeadingSlash = require('../../utils/pathes.js').trimLeadingSlash;
const normalizeUrlPathSeperators = require('../../utils/urls.js').normalizePathSeperators;
const union = require('lodash.union');
const co = require('co');
const VinylFile = require('vinyl');


/**
 * @class
 * @memberOf gulp.model
 * @extends {Base}
 */
class SassRepository extends Base
{
    /**
     * @ignore
     */
    constructor(entitiesRepository, pathesConfiguration, options)
    {
        super();

        //Check params
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Add initial values
        this._entitiesRepository = entitiesRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._defaultGroup = 'common';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, PathesConfiguration, 'gulp.model/SassRepository.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'gulp.model/SassRepository';
    }


    /**
     * Resolves to an object of arrays of sass files that needs
     * to be compiled for the given site.
     *
     * The plan:
     *
     *  - Get all entities
     *  - Divide them into global and entity content
     *  - Create a object that contains a list of files for each group
     *
     * @param {Site} site
     * @returns {Promise.<Array>}
     */
    getFilesBySite(site)
    {
        const scope = this;
        const promise = co(function *()
        {
            const entities = yield scope._entitiesRepository.getBySite(site);
            const files =
            {
                global: {},
                entities: {}
            };

            // Group files
            for (const entity of entities)
            {
                const group = entity.properties.getByPath('groups.css', scope._defaultGroup);
                const sassFiles = entity.files.filter(file => file.contentType == ContentType.SASS && !file.basename.startsWith('_'));

                if (entity.id.category.isGlobal)
                {
                    files.global[group] = files.global[group] || [];
                    Array.prototype.push.apply(files.global[group], sassFiles);
                }
                else
                {
                    files.entities[group] = files.entities[group] || [];
                    Array.prototype.push.apply(files.entities[group], sassFiles);
                }
            }

            // Get Groups
            const groups = union(Object.keys(files.global), Object.keys(files.entities));

            // Prepare result
            const result = {};
            for (const item of groups)
            {
                result[item] = [];
                Array.prototype.push.apply(result[item], files.global[item] || []);
                Array.prototype.push.apply(result[item], files.entities[item] || []);
            }

            return result;
        });
        return promise;
    }


    /**
     * Resolves to an object of arrays of sass files that needs
     * to be compiled for the given site.
     *
     * The plan:
     *
     *  - Get a list of all files via getFilesBySite
     *  - Create a object that contains a scss import vinyl file for each group
     *
     * @param {Site} site
     * @returns {Promise.<Array>}
     */
    getBySite(site)
    {
        const scope = this;
        const promise = co(function *()
        {
            const files = yield scope.getFilesBySite(site);

            // Prepare result
            const result = {};
            for (const group in files)
            {
                let content = '';
                for (const file of files[group])
                {
                    const includePath = normalizeUrlPathSeperators(trimLeadingSlash(file.filename.replace(scope._pathesConfiguration.sites, '')));
                    content+= `@import '${includePath}';\n`;
                }
                result[group] = new VinylFile(
                    {
                        path: site.name.toLowerCase() + '/css/' + group + '.scss',
                        contents: new Buffer(content)
                    });
            }

            return result;
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.SassRepository = SassRepository;
