'use strict';

/**
 * Requirements
 * @ignore
 */
const nunjucks = require('nunjucks');
const FileLoader = require('./loader/FileLoader.js').FileLoader;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const EntitiesRepository = require('../model/entity/EntitiesRepository.js').EntitiesRepository;
const Template = require('./Template.js').Template;
const assertParameter = require('../utils/assert.js').assertParameter;
const intel = require('intel');


/**
 * @memberOf nunjucks
 */
class Environment extends nunjucks.Environment
{
    /**
     * @param {EntitiesRepository} entitiesRepository
     * @param {GlobalConfiguration} globalConfiguration
     * @param {PathesConfiguration} pathesConfiguration
     * @param {BuildConfiguration} buildConfiguration
     * @param {Array} filters
     * @param {Object} options
     */
    constructor(entitiesRepository, globalConfiguration, pathesConfiguration, buildConfiguration, filters, options)
    {
        const opts = options || {};
        const path = opts.path || '';
        opts.autoescape = false;
        const loader = new FileLoader(path, entitiesRepository, buildConfiguration);
        super(loader, opts);

        // Check params
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'buildConfiguration', buildConfiguration, true, BuildConfiguration);

        // Add options
        this._globalConfiguration = globalConfiguration;
        this._entitiesRepository = entitiesRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._buildConfiguration = buildConfiguration;
        this._filters = filters || [];
        this._path = path;
        this._loader = loader;
        this._static = this._buildConfiguration.get('nunjucks.static', false);
        this._template = new Template(this._entitiesRepository, this._path, this._buildConfiguration.environment);

        // Add globals
        this.addGlobal('environment', this._buildConfiguration);

        // Add filters
        for (const filter of this._filters)
        {
            filter.register(this);
        }
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, GlobalConfiguration, PathesConfiguration,
            BuildConfiguration, 'nunjucks/Environment.filters', 'nunjucks/Environment.options'] };
    }


    /**
     * The namespaced class name
     *
     * @type {string}
     * @static
     */
    static get className()
    {
        return 'nunjucks/Environment';
    }


    /**
     * The namespaced class name
     *
     * @type {string}
     */
    get className()
    {
        return this.constructor.className;
    }


    /**
     * The base debug logger
     *
     * @type {intel.logger}
     */
    get logger()
    {
        return intel.getLogger('entoj.' + this.className);
    }


    /**
     * Returns the templates root path used for resolving templates.
     *
     * @type {string}
     */
    get path()
    {
        return this._path;
    }


    /**
     * @type {string}
     */
    set path(value)
    {
        this._path = value;
        this._loader.setSearchPaths(this._path);
        this._template._basePath = this._path;
    }


    /**
     * Returns true if the rendered content should contain
     * no random elements.
     *
     * @type {string}
     */
    get isStatic()
    {
        return this._static;
    }


    /**
     * @type {string}
     */
    set isStatic(value)
    {
        if (this._buildConfiguration.get('nunjucks.static', false) === false)
        {
            this._static = value;
        }
    }


    /**
     * @type {string}
     */
    renderString(content, context, callback)
    {
        const template = this._template.prepare(content, this._buildConfiguration.environment);
        const result = super.renderString(template, context, callback);
        this.logger.verbose('renderString\n', result);
        return result;
    }


    /**
     * @type {string}
     */
    render(name, context, callback)
    {
        const result = super.render(name, context, callback);
        this.logger.verbose('render name=' + name + '\n', result);
        return result;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.Environment = Environment;
