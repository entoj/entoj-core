"use strict";

/**
 * Requirements
 */
let path = require('path');

/**
 * Configure pathes
 */
global.SOURCE_ROOT = path.resolve(__dirname + '/../../../../../source');
global.FIXTURES_ROOT = path.resolve(__dirname + '/../../../../__fixtures__');


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
    {
        type: require(SOURCE_ROOT + '/command/ServerCommand.js').ServerCommand,
        options:
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
                },
                {
                    type: require(SOURCE_ROOT + '/server/routes/SitesRoute.js').SitesRoute,
                    options:
                    {
                        staticFiles: ['jpg', 'png', 'gif', 'svg', 'ttf', 'woff', 'json'],
                        cssBasePath: '${cache}/js',
                        jsBasePath: false
                    }
                }
            ]
        }
    },
    {
        type: require(SOURCE_ROOT + '/command/ScaffoldEntityCommand.js').ScaffoldEntityCommand,
        options:
        {
            templatePath: __dirname + '/templates/scaffolding'
        }
    },
    require(SOURCE_ROOT + '/command/SassCommand.js').SassCommand,
    require(SOURCE_ROOT + '/command/JsCommand.js').JsCommand,
    {
        type: require(SOURCE_ROOT + '/command/LintCommand.js').LintCommand,
        linters:
        [
            {
                type: require(SOURCE_ROOT + '/linter/JsFileLinter.js').JsFileLinter,
                rules:
                {
                    "no-irregular-whitespace": 2,
                    "no-extra-boolean-cast": 2
                }
            }
        ]
    }
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
        require(SOURCE_ROOT + '/model/loader/documentation').ExamplePlugin,
        require(SOURCE_ROOT + '/model/loader/documentation').DatamodelPlugin
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
            longName: 'Template'
        },
        {
            longName: 'Page'
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
        urlRewrite: false,
        browsers: ['ie >= 11', '> 2%'],
        check: true,
        optimize: false,
        minimize: false
    }
};
configuration.build.environments.production =
{
    sass:
    {
        sourceMaps: false,
        check: true,
        urlRewrite: false,
        browsers: ['ie >= 11', '> 2%'],
        optimize: true,
        minimize: true
    }
};


/**
 * Export
 * @ignore
 */
module.exports = configuration;
