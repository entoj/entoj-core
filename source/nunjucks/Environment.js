'use strict';

/**
 * Requirements
 * @ignore
 */
const nunjucks = require('nunjucks');
const FileLoader = require('./loader/FileLoader.js').FileLoader;
const DebugFilter = require('./filter/DebugFilter.js').DebugFilter;
const MarkdownFilter = require('./filter/MarkdownFilter.js').MarkdownFilter;
const LoadFilter = require('./filter/LoadFilter.js').LoadFilter;
const ImageUrlFilter = require('./filter/ImageUrlFilter.js').ImageUrlFilter;
const BreakpointFilter = require('./filter/BreakpointFilter.js').BreakpointFilter;
const MediaQueryFilter = require('./filter/MediaQueryFilter.js').MediaQueryFilter;
const LinkFilter = require('./filter/LinkFilter.js').LinkFilter;
const LinkTypeFilter = require('./filter/LinkTypeFilter.js').LinkTypeFilter;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const EntitiesRepository = require('../model/entity/EntitiesRepository.js').EntitiesRepository;
const Template = require('./Template.js').Template;
const assertParameter = require('../utils/assert.js').assertParameter;


/**
 * @memberOf nunjucks
 */
class Environment extends nunjucks.Environment
{
    /**
     * @param {GlobalConfiguration} globalConfiguration
     * @param {EntitiesRepository} entitiesRepository
     * @param {PathesConfiguration} pathesConfiguration
     * @param {Object} options
     */
    constructor(entitiesRepository, globalConfiguration, pathesConfiguration, buildConfiguration, options)
    {
        const opts = options || {};
        const rootPath = opts.rootPath || '';
        super(new FileLoader(rootPath, entitiesRepository), options);

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
        this._static = this._buildConfiguration.get('nunjucks.static', false);
        this._template = new Template(this._entitiesRepository, rootPath);

        // Register filters
        new DebugFilter(this);
        new MarkdownFilter(this);
        new LoadFilter(this, this._entitiesRepository, this._pathesConfiguration, rootPath);
        new ImageUrlFilter(this, this._buildConfiguration.get('nunjucks.imageUrl', 'internal'));
        new BreakpointFilter(this, this._globalConfiguration.get('breakpoints'));
        new MediaQueryFilter(this, this._globalConfiguration.get('breakpoints'));
        new LinkFilter(this);
        new LinkTypeFilter(this);

        // Add globals
        this.addGlobal('environment', this._buildConfiguration);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, GlobalConfiguration, PathesConfiguration, BuildConfiguration, 'nunjucks/Environment.options'] };
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
        const template = this._template.prepare(content);
        return super.renderString(template, context, callback);
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.Environment = Environment;
