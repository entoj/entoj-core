"use strict";

/**
 * Requirements
 */
const EntityCategory = require(SOURCE_ROOT + '/model/entity/EntityCategory.js').EntityCategory;
const Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
const EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const CompactIdParser = require(SOURCE_ROOT + '/parser/entity/CompactIdParser.js').CompactIdParser;
const EntityId = require(SOURCE_ROOT + '/model/entity/EntityId.js').EntityId;
const Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
const EntityIdTemplate = require(SOURCE_ROOT + '/model/entity/EntityIdTemplate.js').EntityIdTemplate;
const GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const UrlsConfiguration = require(SOURCE_ROOT + '/model/configuration/UrlsConfiguration.js').UrlsConfiguration;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require(SOURCE_ROOT + '/model/configuration/BuildConfiguration.js').BuildConfiguration;
const Environment = require(SOURCE_ROOT + '/nunjucks/Environment.js').Environment;
const MarkdownFilter = require(SOURCE_ROOT + '/nunjucks/filter/MarkdownFilter.js').MarkdownFilter;


/**
 * Creates a documentation fixture
 */
function createFixture()
{
    const fixture = {};

    fixture.options =
    {
        templateRoot: __dirname + '/Documentation',
        routeHomepage: '/',
        templateHomepage: '/homepage.j2'
    };

    fixture.globalConfiguration = new GlobalConfiguration();

    fixture.categoryElement = new EntityCategory('Element');
    fixture.categoryModule = new EntityCategory('Module');
    fixture.categoriesRepository = new EntityCategoriesRepository();
    fixture.categoriesRepository.add(fixture.categoryElement);
    fixture.categoriesRepository.add(fixture.categoryModule);

    fixture.siteDefault = new Site('Default');
    fixture.siteExtended = new Site('Extended');
    fixture.siteExtended.extends = fixture.siteDefault;
    fixture.sitesRepository = new SitesRepository();
    fixture.sitesRepository.add(fixture.siteDefault);
    fixture.sitesRepository.add(fixture.siteExtended);

    fixture.entityIdParser = new CompactIdParser(fixture.sitesRepository, fixture.categoriesRepository);
    fixture.entityIdTemplate = fixture.entityIdParser.idTemplate;

    fixture.entityIdGallery = new EntityId(fixture.categoryModule, 'gallery', 1, fixtures.siteDefault, fixture.entityIdTemplate);
    fixture.entityGallery = new Entity(fixture.entityIdGallery);
    fixture.entityGallery.usedBy.push(fixture.siteExtended);
    fixture.entitiesRepository = new EntitiesRepository(fixture.entityIdParser);
    fixture.entitiesRepository.add(fixture.entityGallery);

    const siteTemplate = '${site.name.urlify()}';
    const entityCategoryTemplate = siteTemplate + '/${entityCategory.pluralName.urlify()}';
    const entityIdTemplate = entityCategoryTemplate + '/${entityCategory.shortName.urlify()}${entityId.number}-${entityId.name.urlify()}';
    const options =
    {
        root: '',
        siteTemplate: '${root}/' + siteTemplate,
        entityCategoryTemplate: '${root}/' + entityCategoryTemplate,
        entityIdTemplate: '${root}/' + entityIdTemplate
    };

    fixture.pathesConfiguration = new PathesConfiguration();

    fixture.urlsConfiguration = new UrlsConfiguration(options,
            fixture.sitesRepository, fixture.categoriesRepository,
            fixture.entitiesRepository, fixture.entityIdParser);

    fixture.buildConfiguration = new BuildConfiguration();

    fixture.nunjucks = new Environment(fixture.entitiesRepository, fixture.globalConfiguration,
        fixture.pathesConfiguration, fixture.buildConfiguration, [new MarkdownFilter()]);

    return fixture;
}


/**
 * Exports
 */
module.exports.createFixture = createFixture;
