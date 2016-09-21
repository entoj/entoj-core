"use strict";

/**
 * Requirements
 */
let EntityCategory = require(SOURCE_ROOT + '/model/entity/EntityCategory.js').EntityCategory;
let EntityId = require(SOURCE_ROOT + '/model/entity/EntityId.js').EntityId;
let Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
let Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
let File = require(SOURCE_ROOT + '/model/file/File.js').File;
let EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
let EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
let SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
let EntityIdTemplate = require(SOURCE_ROOT + '/model/entity/EntityIdTemplate.js').EntityIdTemplate;
let PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
let GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
let BuildConfiguration = require(SOURCE_ROOT + '/model/configuration/BuildConfiguration.js').BuildConfiguration;
let CompactIdParser = require(SOURCE_ROOT + '/parser/entity/CompactIdParser.js').CompactIdParser;
let UrlsConfiguration = require(SOURCE_ROOT + '/model/configuration/UrlsConfiguration.js').UrlsConfiguration;


/**
 * Creates a complete fixture
 */
function createFixture(dontExtend)
{
    let fixture = {};

    fixture.basePath = __dirname + '/Compact';

    fixture.globalConfiguration = new GlobalConfiguration();
    fixture.buildConfiguration = new BuildConfiguration();
    fixture.pathes = new PathesConfiguration(
    {
        root: FIXTURES_ROOT + '/Entities/Compact',
        sitesTemplate: '${root}',
        siteTemplate: '${sites}/${site.name.toLowerCase()}',
        entityCategoryTemplate: '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}',
        entityIdTemplate: '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}/${entityCategory.shortName}${entityId.number.format(3)}-${entityId.name}',
        entityIdGlobalTemplate: '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}'
    });
    fixture.pathesConfiguration = fixture.pathes;

    fixture.categoryElement = new EntityCategory('Element');
    fixture.categoryModule = new EntityCategory('Module');
    fixture.categoryModuleGroup = new EntityCategory('Module Group', undefined, 'g');
    fixture.categoryCommon = new EntityCategory('Common', 'Common', 'c', true);
    fixture.categoriesRepository = new EntityCategoriesRepository();
    fixture.categoriesRepository.add(fixture.categoryElement);
    fixture.categoriesRepository.add(fixture.categoryModule);
    fixture.categoriesRepository.add(fixture.categoryModuleGroup);
    fixture.categoriesRepository.add(fixture.categoryCommon);

    fixture.siteDefault = new Site('Default');
    fixture.siteExtended = new Site('Extended');
    fixture.sitesRepository = new SitesRepository();
    fixture.sitesRepository.add(fixture.siteDefault);
    fixture.sitesRepository.add(fixture.siteExtended);

    fixture.entityIdParser = new CompactIdParser(fixture.sitesRepository, fixture.categoriesRepository);
    fixture.entityIdTemplate = fixture.entityIdParser.idTemplate;

    fixture.entityIdGallery = new EntityId(fixture.categoryModule, 'gallery', 1, fixture.siteDefault, fixture.entityIdTemplate);
    fixture.entityGallery = new Entity(fixture.entityIdGallery);
    fixture.entityGallery.files.push(new File(fixture.pathesConfiguration.root + '/default/modules/m001-gallery/examples/default.j2',
        undefined, undefined, undefined, fixture.siteDefault));

    fixture.entityIdButton = new EntityId(fixture.categoryElement, 'button', 5, fixture.siteDefault, fixture.entityIdTemplate);
    fixture.entityButton = new Entity(fixture.entityIdButton);
    fixture.entityIdCommon = new EntityId(fixture.categoryCommon, '', 0, fixture.siteDefault, fixture.entityIdTemplate);
    fixture.entityCommon = new Entity(fixture.entityIdCommon);

    if (!dontExtend)
    {
        fixture.siteExtended.properties.set('extends', 'default');
        fixture.siteExtended.extends = fixture.siteDefault;
        fixture.entityGallery.usedBy.push(fixture.siteExtended);
        fixture.entityButton.usedBy.push(fixture.siteExtended);
        fixture.entityCommon.usedBy.push(fixture.siteExtended);
    }

    fixture.entitiesRepository = new EntitiesRepository(fixture.entityIdParser);
    fixture.entitiesRepository.add(fixture.entityGallery);
    fixture.entitiesRepository.add(fixture.entityButton);
    fixture.entitiesRepository.add(fixture.entityCommon);

    fixture.urlsConfiguration = new UrlsConfiguration({}, fixture.sitesRepository,
        fixture.categoriesRepository, fixture.entitiesRepository,
        fixture.entityIdParser, fixture.pathesConfiguration);

    return fixture;
}


/**
 * Exports
 */
module.exports.createFixture = createFixture;
