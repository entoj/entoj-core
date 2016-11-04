'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const DIContainer = require('../utils/DIContainer.js').DIContainer;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const UrlsConfiguration = require('../model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const EntityCategoriesRepository = require('../model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const EntityCategoriesLoader = require('../model/entity/EntityCategoriesLoader.js').EntityCategoriesLoader;
const EntitiesRepository = require('../model/entity/EntitiesRepository.js').EntitiesRepository;
const EntitiesLoader = require('../model/entity/EntitiesLoader.js').EntitiesLoader;
const IdParser = require('../parser/entity/IdParser.js').IdParser;
const CompactIdParser = require('../parser/entity/CompactIdParser.js').CompactIdParser;
const SitesRepository = require('../model/site/SitesRepository.js').SitesRepository;
const SitesLoader = require('../model/site/SitesLoader.js').SitesLoader;
const FilesRepository = require('../model/file/FilesRepository.js').FilesRepository;
const ModelSynchronizer = require('../watch/ModelSynchronizer.js').ModelSynchronizer;


/**
 * Context is the backbone of the application.
 * It parses the given configuration and sets up appropriate dependency
 * injection bindings.
 *
 * @memberOf application
 */
class Context extends Base
{
    /**
     * @param {object} configuration
     */
    constructor(configuration)
    {
        super();

        this._di = new DIContainer();
        this._configuration = configuration || {};
        this._parameters = this._configuration.parameters || {};
        this.configure();
        Context._instance = this;
    }


    /**
     * @inheritDoc
     */
    static get instance()
    {
        if (!Context._instance)
        {
            throw new Error(Context.className + ': No Context configured');
        }
        return Context._instance;
    }

    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'application/Context';
    }


    /**
     * @type {Object}
     */
    get parameters()
    {
        return this._parameters;
    }


    /**
     * @type {Object}
     */
    get configuration()
    {
        return this._configuration;
    }


    /**
     * @type {DIContainer}
     */
    get di()
    {
        return this._di;
    }


    /**
     * Maps type to use the given type configuration.
     *
     * @protected
     * @param {Function} type - The type to be mapped
     * @param {Boolean} singleton - Should the type be treated as a singelton?
     * @param {Object|Function} configuration - The mapping configuration or a target type
     * @param {Function} configuration.type - The target type
     * @param {Array} configuration.$name - options starting with a $ will get instanciated via createInstances
     * @param {Array} configuration.name - option will get mapped via a named mapping
     */
    mapType(type, singleton, configuration, parameters)
    {
        if (!configuration)
        {
            return;
        }

        // Map type
        this._di.map(type, (typeof configuration === 'function') ? configuration : configuration.type, singleton);

        // Map options
        if (typeof configuration !== 'function')
        {
            const params = parameters || {};
            params.type = false;
            params.sourceType = false;
            for (const name in configuration)
            {
                // Handle instanciation of special properties
                if (name.startsWith('!'))
                {
                    const items = this.createInstances(configuration[name]);
                    this._di.map(configuration.type.className + '.' + name.substring(1), items);
                }
                // Handle configured instanciations
                else if (typeof params[name] === 'function')
                {
                    this._di.map(configuration.type.className + '.' + name, params[name](configuration[name]));
                }
                // Handle simple mapping
                else
                {
                    this._di.map(configuration.type.className + '.' + name, configuration[name]);
                }
            }
        }
    }


    /**
     * Creates instance of the given type configuration.
     *
     * @protected
     * @returns {Array}
     */
    createInstance(configuration, singleton)
    {
        if (!configuration)
        {
            throw new TypeError('Trying to create type with a undefined configuration');
        }
        // Create options
        const options = new Map();
        if (typeof configuration !== 'function')
        {
            for (const name in configuration)
            {
                if (name !== 'type')
                {
                    options.set(configuration.type.className + '.' + name, configuration[name]);
                }
            }
        }

        // Create instance
        const type = (typeof configuration === 'function') ? configuration : configuration.type;
        const result = this._di.create(type, options, singleton);

        return result;
    }


    /**
     * Creates an array of instance of the given type configuration.
     *
     * @protected
     * @returns {Array}
     */
    createInstances(configurations, singleton)
    {
        if (!Array.isArray(configurations))
        {
            return [];
        }

        const result = [];
        for (const config of configurations)
        {
            const instance = this.createInstance(config, singleton);
            result.push(instance);
        }

        return result;
    }


    /**
     * @protected
     * @returns {Promise}
     */
    configureLogger()
    {
        const intel = require('intel');
        const logger = intel.getLogger('entoj');

        if (this.parameters.v)
        {
            logger.setLevel(intel.WARN);
        }
        if (this.parameters.vv)
        {
            logger.setLevel(intel.INFO);
        }
        if (this.parameters.vvv)
        {
            logger.setLevel(intel.DEBUG);
        }
        if (this.parameters.vvvv)
        {
            logger.setLevel(intel.TRACE);
        }
    }


    /**
     * @protected
     * @returns {Promise}
     */
    configureDependencies()
    {
        // Di
        this.logger.debug('Setup di');
        this._di.map(DIContainer, this._di, true);

        // Globals
        this._di.map('cli/CliLogger.options', {});
        this._di.map(ModelSynchronizer, ModelSynchronizer, true);

        // Configs
        this.logger.debug('Setup configurations');
        this._di.map(Context, this, true);
        this._di.map('model.configuration/GlobalConfiguration.options', this._configuration.settings || {});
        this._di.map(GlobalConfiguration, GlobalConfiguration, true);
        this._di.map('model.configuration/PathesConfiguration.options', this._configuration.pathes || {});
        this._di.map(PathesConfiguration, PathesConfiguration, true);
        this._di.map('model.configuration/UrlsConfiguration.options', this._configuration.urls || {});
        this._di.map(UrlsConfiguration, UrlsConfiguration, true);
        this._di.map('model.configuration/BuildConfiguration.options', this._configuration.build || {});
        if (this._configuration.parameters && this._configuration.parameters.environment)
        {
            this._di.map('model.configuration/BuildConfiguration.environment', this._configuration.parameters.environment);
        }
        this._di.map(BuildConfiguration, BuildConfiguration, true);

        // Global mappings
        if (this._configuration.mappings && this._configuration.mappings.length)
        {
            for (const mapping of this._configuration.mappings)
            {
                const type = (typeof mapping === 'function') ? mapping : mapping.type;
                const sourceType = mapping.sourceType || type;
                if (sourceType)
                {
                    this.mapType(sourceType, undefined, mapping);
                }
            }
        }

        // Repositories
        this.logger.debug('Setup repositories');
        this._di.map(SitesRepository, SitesRepository, true);
        this._di.map(EntityCategoriesRepository, EntityCategoriesRepository, true);
        this._di.map(EntitiesRepository, EntitiesRepository, true);
        this._di.map(FilesRepository, FilesRepository, true);

        // Sites
        this.logger.debug('Setup sites');
        if (this._configuration.sites && this._configuration.sites.loader)
        {
            this.mapType(SitesLoader, true, this._configuration.sites.loader, { plugins: this.createInstances.bind(this) });
        }

        // EntityCategories
        this.logger.debug('Setup entity categories');
        if (this._configuration.entityCategories && this._configuration.entityCategories.loader)
        {
            this.mapType(EntityCategoriesLoader, true, this._configuration.entityCategories.loader, { plugins: this.createInstances.bind(this) });
        }

        // Entity Id parser
        this.logger.debug('Setup entity id parser');
        this._di.map(IdParser, CompactIdParser, true);
        if (this._configuration.entities && this._configuration.entities.idParser)
        {
            this.mapType(IdParser, true, this._configuration.entities.idParser);
        }

        // Entities
        this.logger.debug('Setup entities');
        if (this._configuration.entities && this._configuration.entities.loader)
        {
            this.mapType(EntitiesLoader, true, this._configuration.entities.loader, { plugins: this.createInstances.bind(this) });
        }

        // Commands
        this.logger.debug('Setup commands');
        if (this._configuration.commands && this._configuration.commands.length)
        {
            const commands = [];
            for (const command of this._configuration.commands)
            {
                const commandType = (typeof command === 'function') ? command : command.type;
                this.mapType(commandType, false, command, { linters: this.createInstances.bind(this) });
                commands.push(commandType);
            }
            this._di.map('application/Runner.commands', commands);
        }
    }


    /**
     * @protected
     */
    configure()
    {
        this.configureLogger();
        this.configureDependencies();
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.Context = Context;
