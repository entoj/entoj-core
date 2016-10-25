'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const EntitiesRepository = require('../entity/EntitiesRepository.js').EntitiesRepository;
const Site = require('../site/Site.js').Site;
const ContentType = require('../ContentType.js');
const assertParameter = require('../../utils/assert.js').assertParameter;
const co = require('co');


/**
 * @class
 * @memberOf model.file
 * @extends {Base}
 */
class FilesRepository extends Base
{
    /**
     * @param {model.entity.EntitiesRepository} entitiesRepository
     */
    constructor(entitiesRepository)
    {
        super();

        // Check params
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);

        // Assign
        this._entitiesRepository = entitiesRepository;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.file/FilesRepository';
    }


    /**
     * Resolves to a list of all files for the given site.
     * Optional the result may be filtered via a filter function.
     */
    getBySite(site, filter)
    {
        if (!site)
        {
            return Promise.resolve([]);
        }
        const scope = this;
        const promise = co(function*()
        {
            const filesFilter = filter ? filter : () => true;
            const entities = yield scope._entitiesRepository.getBySite(site);
            const result = [];
            for (const entity of entities)
            {
                Array.prototype.push.apply(result, entity.files.filter(filesFilter));
            }
            return result;
        });
        return promise;
    }


    /**
     * Resolves to a list of files grouped by a property
     * defined by the owning entity (eg. groups.css).
     */
    getBySiteGrouped(site, filter, property, propertyDefault)
    {
        if (!site)
        {
            return Promise.resolve({});
        }
        const scope = this;
        const promise = co(function*()
        {
            const filesFilter = filter ? filter : () => true;
            const entities = yield scope._entitiesRepository.getBySite(site);
            const result = {};
            for (const entity of entities)
            {
                const group = entity.properties.getByPath(property, propertyDefault);
                result[group] = result[group] || [];
                Array.prototype.push.apply(result[group], entity.files.filter(filesFilter));
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
module.exports.FilesRepository = FilesRepository;
