'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const assertParameter = require('../../utils/assert.js').assertParameter;
const union = require('lodash.union');
const co = require('co');


/**
 * @class
 * @memberOf gulp.model
 * @extends {Base}
 */
class BaseRepository extends Base
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
        const opts = options || {};
        this._entitiesRepository = entitiesRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._defaultGroup = opts.defaultGroup || 'common';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, PathesConfiguration, 'gulp.model/BaseRepository.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'gulp.model/BaseRepository';
    }


    /**
     * Resolves to an object of files grouped by groups.{groupName}
     *
     * @param {Site} site
     * @param {String} groupName
     * @param {Function} filter
     * @returns {Promise.<Object>}
     */
    getGroupedFilesBySite(site, groupName, filter)
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
                const group = entity.properties.getByPath('groups.' + groupName, scope._defaultGroup);
                let entityFiles;
                if (filter)
                {
                    entityFiles = entity.files.filter(filter);
                }
                else
                {
                    entityFiles = entity.files;
                }

                if (entity.id.category.isGlobal)
                {
                    files.global[group] = files.global[group] || [];
                    Array.prototype.push.apply(files.global[group], entityFiles);
                }
                else
                {
                    files.entities[group] = files.entities[group] || [];
                    Array.prototype.push.apply(files.entities[group], entityFiles);
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
}

/**
 * Exports
 * @ignore
 */
module.exports.BaseRepository = BaseRepository;
