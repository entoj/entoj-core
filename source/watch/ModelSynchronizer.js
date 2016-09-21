'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const FileWatcher = require('./FileWatcher.js').FileWatcher;
const SitesRepository = require('../model/site/SitesRepository.js').SitesRepository;
const EntityCategoriesRepository = require('../model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const EntitiesRepository = require('../model/entity/EntitiesRepository.js').EntitiesRepository;
const assertParameter = require('../utils/assert.js').assertParameter;
const co = require('co');
const signals = require('signals');


/**
 * @memberOf watch
 */
class ModelSynchronizer extends Base
{
    /**
     * @param {CliLogger} cliLogger
     * @param {EntityCategoriesRepository} entityCategoriesRepository
     */
    constructor(cliLogger, fileWatcher, sitesRepository, entityCategoriesRepository, entitiesRepository, options)
    {
        super();

        //Check params
        assertParameter(this, 'cliLogger', cliLogger, true, CliLogger);
        assertParameter(this, 'fileWatcher', fileWatcher, true, FileWatcher);
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'entityCategoriesRepository', entityCategoriesRepository, true, EntityCategoriesRepository);
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);

        // Assign options
        this._cliLogger = cliLogger.createPrefixed('modelsynchronizer');
        this._fileWatcher = fileWatcher;
        this._sitesRepository = sitesRepository;
        this._entityCategoriesRepository = entityCategoriesRepository;
        this._entitiesRepository = entitiesRepository;
        this._signals = {};

        // Add signals
        this.signals.invalidated = new signals.Signal();

        // Add listeners
        this._fileWatcher.signals.changed.add((watcher, changes) => this.processChanges(changes));
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, FileWatcher, SitesRepository, EntityCategoriesRepository, EntitiesRepository, 'watch/ModelSynchronizer.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'watch/ModelSynchronizer';
    }


    /**
     * @inheritDocs
     */
    get signals()
    {
        return this._signals;
    }


    /**
     * @returns {Promise.<*>}
     */
    processChanges(changes)
    {
        const scope = this;
        const promise = co(function *()
        {
            let work;
            const result =
            {
                files: changes.files,
                extensions: changes.extensions
            };

            // Apply changes for sites
            if (changes.site)
            {
                work = scope._cliLogger.work('Invalidating <SitesRepository>');
                result.site = yield scope._sitesRepository.invalidate();
                scope._cliLogger.end(work);

                work = scope._cliLogger.work('Invalidating <EntitiesRepository>');
                result.entityCategory = yield scope._entitiesRepository.invalidate();
                scope._cliLogger.end(work);
            }
            // Apply changes for entities
            else if (changes.entity)
            {
                work = scope._cliLogger.work('Invalidating <EntitiesRepository>');
                result.entity = yield scope._entitiesRepository.invalidate(changes.entity);
                scope._cliLogger.end(work);
            }

            // dispatch signal
            scope.signals.invalidated.dispatch(scope, result);

            return result;
        })
        .catch(function(e)
        {
            scope._cliLogger.error(e);
            throw new Error('ModelSynchronizer.processChanges - ' + e);
        });
        return promise;
    }


    /**
     * @returns {Promise.<*>}
     */
    start()
    {
        return this._fileWatcher.start();
    }


    /**
     * @returns {Promise.<*>}
     */
    stop()
    {
        return this._fileWatcher.stop();
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ModelSynchronizer = ModelSynchronizer;
