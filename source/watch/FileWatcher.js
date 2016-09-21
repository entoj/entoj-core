'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const EntityCategoriesRepository = require('../model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const EntityCategory = require('../model/entity/EntityCategory.js').EntityCategory;
const IdParser = require('../parser/entity/IdParser.js').IdParser;
const assertParameter = require('../utils/assert.js').assertParameter;
const chokidar = require('chokidar');
const co = require('co');
const debounce = require('lodash.debounce');
const uniq = require('lodash.uniq');
const difference = require('lodash.difference');
const clone = require('lodash.clone');
const signals = require('signals');
const path = require('path');
const PATH_SEPERATOR = require('path').sep;


/**
 * @memberOf watch
 */
class FileWatcher extends Base
{
    /**
     * @param {CliLogger} cliLogger
     * @param {PathesConfiguration} pathesConfiguration
     * @param {EntityCategoriesRepository} entityCategoriesRepository
     * @param {IdParser} entityIdParser
     * @param {*} options
     */
    constructor(cliLogger, pathesConfiguration, entityCategoriesRepository, entityIdParser, options)
    {
        super();

        //Check params
        assertParameter(this, 'cliLogger', cliLogger, true, CliLogger);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'entityCategoriesRepository', entityCategoriesRepository, true, EntityCategoriesRepository);
        assertParameter(this, 'entityIdParser', entityIdParser, true, IdParser);

        // Assign options
        const scope = this;
        const opts = options || {};
        this._cliLogger = cliLogger.createPrefixed('filewatcher');
        this._pathesConfiguration = pathesConfiguration;
        this._entityCategoriesRepository = entityCategoriesRepository;
        this._entityIdParser = entityIdParser;
        this._signals = {};
        this._events = [];

        // Add signals
        this.signals.changed = new signals.Signal();

        // Add debounced handler
        this._processEventsDebounced = debounce(function()
        {
            scope.processEvents(clone(this._events));
        }, opts.debounce || 250);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, PathesConfiguration, EntityCategoriesRepository, IdParser, 'watch/FileWatcher.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'watch/FileWatcher';
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
    processEvents(events)
    {
        this._events = [];
        const scope = this;
        const promise = co(function *()
        {
            const result =
            {
                files: [],
                extensions: [],
                sites: []
            };
            for (const event of events)
            {
                // Add path & extension
                result.files.push(event.path);
                if (path.extname(event.path) != '')
                {
                    result.extensions.push(path.extname(event.path));
                }

                // Prepare
                const parts = event.path.split(PATH_SEPERATOR);
                const siteName = parts[1] || false;
                const entityCategoryName = parts[2] || false;
                const entityName = parts[3] || false;
                let entityCategory;
                if (entityCategoryName)
                {
                    entityCategory = yield scope._entityCategoriesRepository.findBy(EntityCategory.ANY, entityCategoryName);
                }
                let entityId;
                if (entityName)
                {
                    entityId = yield scope._entityIdParser.parse(entityName);
                }
                let eventName = event.name;

                // Site
                if (siteName)
                {
                    result.sites.push(siteName);
                    if (!entityCategory  && (!entityCategoryName || entityCategoryName.indexOf('.') !== -1) && !entityId)
                    {
                        if (parts.length > 2)
                        {
                            eventName = 'add';
                        }
                        result.site = result.site || {};
                        result.site[eventName] = result.site[eventName] || [];
                        result.site[eventName].push('/' + siteName);

                        const sitePath = '/' + siteName;
                        if (result.site[eventName].indexOf(sitePath) === -1)
                        {
                            result.site[eventName].push(sitePath);
                        }
                    }
                }

                // EntityCategory
                if (siteName && entityCategory && !entityCategory.isGlobal && !entityId)
                {
                    if (parts.length > 3)
                    {
                        eventName = 'add';
                    }
                    result.entityCategory = result.entityCategory || {};
                    result.entityCategory[eventName] = result.entityCategory[eventName] || [];

                    const entityCategoryPath = '/' + siteName + '/' + entityCategoryName;
                    if (result.entityCategory[eventName].indexOf(entityCategoryPath) === -1)
                    {
                        result.entityCategory[eventName].push(entityCategoryPath);
                    }
                }

                // Global EntityCategory
                if (siteName && entityCategory && entityCategory.isGlobal && !entityId)
                {
                    if (parts.length > 3)
                    {
                        eventName = 'add';
                    }
                    result.entity = result.entity || {};
                    result.entity[eventName] = result.entity[eventName] || [];

                    const entityPath = '/' + siteName + '/' + entityCategoryName;
                    if (result.entity[eventName].indexOf(entityPath) === -1)
                    {
                        result.entity[eventName].push(entityPath);
                    }
                }


                // Entity
                if (siteName && entityCategory && entityId)
                {
                    if (parts.length > 4)
                    {
                        eventName = 'add';
                    }
                    result.entity = result.entity || {};
                    result.entity[eventName] = result.entity[eventName] || [];

                    const entityPath = '/' + siteName + '/' + entityCategoryName + '/' + entityName;
                    if (result.entity[eventName].indexOf(entityPath) === -1)
                    {
                        result.entity[eventName].push(entityPath);
                    }
                }
            }

            // Remove has higher priority than add
            if (result.site && result.site.add && result.site.remove)
            {
                result.site.add = difference(result.site.add, result.site.remove);
                if (!result.site.add.length)
                {
                    delete result.site.add;
                }
            }
            if (result.entityCategory && result.entityCategory.add && result.entityCategory.remove)
            {
                result.entityCategory.add = difference(result.entityCategory.add, result.entityCategory.remove);
                if (!result.entityCategory.add.length)
                {
                    delete result.entityCategory.add;
                }
            }
            if (result.entity && result.entity.add && result.entity.remove)
            {
                result.entity.add = difference(result.entity.add, result.entity.remove);
                if (!result.entity.add.length)
                {
                    delete result.entity.add;
                }
            }

            // Make pathes & extensions unique
            result.files = uniq(result.files);
            result.extensions = uniq(result.extensions);
            result.sites = uniq(result.sites);

            // Done
            scope._cliLogger.info('Detected changes:');
            for (const file of result.files)
            {
                scope._cliLogger.info('  - File <' + file + '>');
            }
            if (result.entity && result.entity.add)
            {
                for (const entity of result.entity.add)
                {
                    scope._cliLogger.info('  - Add Entity <' + entity.toString() + '>');
                }
            }
            if (result.entity && result.entity.remove)
            {
                for (const entity of result.entity.remove)
                {
                    scope._cliLogger.info('  - Remove Entity <' + entity.toString() + '>');
                }
            }
            scope.signals.changed.dispatch(scope, clone(result));

            return result;
        })
        .catch(function(e)
        {
            scope._cliLogger.error(e);
            throw new Error('FileWatcher.processEvents - ' + e);
        });
        return promise;
    }


    /**
     * @returns {void}
     */
    addEvent(type, path)
    {
        if (type !== 'error' && type !== 'ready' && type !== 'raw')
        {
            const event =
            {
                name: 'add',
                path: '/' + path
            };
            if (type === 'unlink' || type === 'unlinkDir')
            {
                event.name = 'remove';
            }
            this._events.push(event);
        }
        this._processEventsDebounced();
    }


    /**
     * @returns {Promise.<*>}
     */
    start()
    {
        const scope = this;
        const promise = new Promise(function(resolve)
        {
            scope._cliLogger.info('Watching for file changes in <' + scope._pathesConfiguration.sites + '>');
            scope._watcher = chokidar.watch(scope._pathesConfiguration.sites + '/**',
                {
                    ignored: /[\/\\]\./,
                    ignoreInitial: true,
                    cwd: scope._pathesConfiguration.sites
                });
            scope._watcher.on('all', scope.addEvent.bind(scope));
            scope._watcher.on('ready', resolve);
        });
        return promise;
    }


    /**
     * @returns {Promise.<*>}
     */
    stop()
    {
        this._watcher.close();
        return Promise.resolve();
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.FileWatcher = FileWatcher;
