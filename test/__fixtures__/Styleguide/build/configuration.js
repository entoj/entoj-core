"use strict";

/**
 * Requirements
 */
let path = require('path');

/**
 * Configure pathes
 */
global.SOURCE_ROOT = path.resolve(__dirname + '/../../../../source');
global.FIXTURES_ROOT = path.resolve(__dirname + '/../../../__fixtures__');


/**
 * Configure
 */
let configuration = {};


// Global settings
configuration.settings =
{
    breakpoints:
    {
        mobile:
        {
            maxWidth: '320px'
        },
        phablet:
        {
            minWidth: '321px',
            maxWidth: '767px'
        },
        miniTablet:
        {
            minWidth: '768px',
            maxWidth: '1023px'
        },
        tablet:
        {
            minWidth: '1024px',
            maxWidth: '1199px'
        },
        desktop:
        {
            minWidth: '1200px'
        }
    }
};


// Logger
configuration.logger =
{
    cli: true,
    debug: true
};


// Some helpers
let siteTemplate = '${site.name.urlify()}';
let entityCategoryTemplate = siteTemplate + '/${entityCategory.pluralName.urlify()}';
let entityIdTemplate = entityCategoryTemplate + '/${entityCategory.shortName.urlify()}${entityId.number.format(3)}-${entityId.name.urlify()}';


// Urls
configuration.urls =
{
    root: '',
    siteTemplate: '${root}/' + siteTemplate,
    sitePattern: '^${root}/(?<sites>[\\w\\d_]+)$',
    entityCategoryTemplate: '${root}/' + entityCategoryTemplate,
    entityIdTemplate: '${root}/' + entityIdTemplate
};


// Pathes
configuration.pathes =
{
    root: path.resolve(__dirname + '/..'),
    cacheTemplate: '${root}/entoj/cache',
    sitesTemplate: '${root}/sites',
    siteTemplate: '${sites}/' + siteTemplate,
    entityCategoryTemplate: '${sites}/' + entityCategoryTemplate,
    entityIdTemplate: '${sites}/' + entityIdTemplate
};


// Commands
configuration.commands =
[
];


// Sites
configuration.sites = {};
configuration.sites.loader =
{
    type: require(SOURCE_ROOT + '/model/site').SitesLoader,
    plugins:
    [
        require(SOURCE_ROOT + '/model/loader/documentation').PackagePlugin,
        require(SOURCE_ROOT + '/model/loader/documentation').MarkdownPlugin
    ]
}


// Entities
configuration.entities = {};
configuration.entities.idParser = require(SOURCE_ROOT + '/parser/entity/CompactIdParser.js').CompactIdParser;
configuration.entities.loader =
{
    type: require(SOURCE_ROOT + '/model/entity').EntitiesLoader,
    plugins:
    [
        require(SOURCE_ROOT + '/model/loader/documentation').PackagePlugin,
        require(SOURCE_ROOT + '/model/loader/documentation').JsPlugin,
        require(SOURCE_ROOT + '/model/loader/documentation').MarkdownPlugin,
        require(SOURCE_ROOT + '/model/loader/documentation').JinjaPlugin,
        require(SOURCE_ROOT + '/model/loader/documentation').SassPlugin,
        require(SOURCE_ROOT + '/model/loader/documentation').ExamplePlugin
    ]
}


// EntityCategories
configuration.entityCategories = {};
configuration.entityCategories.loader =
{
    type: require(SOURCE_ROOT + '/model/entity').EntityCategoriesLoader,
    categories:
    [
        {
            longName: 'Common',
            pluralName: 'Common',
            isGlobal: true
        },
        {
            longName: 'Element'
        },
        {
            longName: 'Module'
        },
        {
            shortName: 'g',
            longName: 'Module Group'
        },
        {
            short: 'r',
            longName: 'Grid'
        },
        {
            longName: 'Page Template'
        },
        {
            shortName: 't',
            longName: 'Page Type'
        }
    ]
};


// Build settings
configuration.build = {};
configuration.build.default = 'development';
configuration.build.environments = {};
configuration.build.environments.development =
{
    sass:
    {
        sourceMaps: true,
        comments: false,
        optimize: false,
        minimize: false
    }
};


/**
 * Export
 * @ignore
 */
module.exports = configuration;
