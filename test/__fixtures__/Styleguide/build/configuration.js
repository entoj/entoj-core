"use strict";

/**
 * Requirements
 */
let path = require('path');


/**
 * Configure
 */
let configuration = {};

// Logger
configuration.logger =
{
    cli: true,
    debug: true
};


// Some helpers
let siteTemplate = '${site.name.toLowerCase()}';
let entityCategoryTemplate = siteTemplate + '/${entityCategory.pluralName.urlify()}';
let entityIdTemplate = entityCategoryTemplate + '/${entityCategory.shortName.urlify()}${entityId.number}-${entityId.name.urlify()}';


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
    sitesTemplate: '${root}/sites',
    siteTemplate: '${sites}/' + siteTemplate,
    entityCategoryTemplate: '${sites}/' + entityCategoryTemplate,
    entityIdTemplate: '${sites}/' + entityIdTemplate
};


// Commands
configuration.commands =
[
    require(SOURCE_ROOT + '/command/ServerCommand.js').ServerCommand
];


// Server
configuration.server =
{
    port: 3100,
    routes:
    [
        {
            type: require(SOURCE_ROOT + '/server/routes/PagesRoute.js').PagesRoute,
            routes:
            [
                {
                    url: '/',
                    template: 'index.j2'
                },
                {
                    url: '/:template(base)',
                    template: 'index.j2'
                }
            ],
            options:
            {
                templateRoot: path.resolve(__dirname + '/templates/pages')
            }
        }
    ]
};


// Sites
configuration.sites = {};
configuration.sites.loader = require(SOURCE_ROOT + '/model/site').SitesLoader;
configuration.sites.plugins =
[
    require(SOURCE_ROOT + '/model/loader/documentation').PackagePlugin,
    require(SOURCE_ROOT + '/model/loader/documentation').MarkdownPlugin
]


// Entities
configuration.entities = {};
configuration.entities.idParser = require(SOURCE_ROOT + '/model/entity').EntityIdCompactParser;

// EntityCategories
configuration.entityCategories = {};
configuration.entityCategories.loader =
{
    type: false,
    data:
    [
        {
            longName: 'Global',
            pluralName: 'Global',
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


/**
 * Export
 * @ignore
 */
module.exports = configuration;
