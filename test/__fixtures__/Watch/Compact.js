"use strict";

/**
 * Requirements
 */
let EntityCategory = require(SOURCE_ROOT + '/model/entity/EntityCategory.js').EntityCategory;
let EntityId = require(SOURCE_ROOT + '/model/entity/EntityId.js').EntityId;
let Entity = require(SOURCE_ROOT + '/model/entity/Entity.js').Entity;
let Site = require(SOURCE_ROOT + '/model/site/Site.js').Site;
let SitesLoader = require(SOURCE_ROOT + '/model/site/SitesLoader.js').SitesLoader;
let EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
let EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
let EntitiesLoader = require(SOURCE_ROOT + '/model/entity/EntitiesLoader.js').EntitiesLoader;
let SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
let PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
let CompactIdParser = require(SOURCE_ROOT + '/parser/entity/CompactIdParser.js').CompactIdParser;
let path = require('path');
let fs = require('fs-extra');


/**
 * Creates a complete fixture
 */
function createFixture()
{
    let fixture = {};

    fixture.basePath = __dirname + '/Compact';
    fixture.sourcePath = path.resolve(__dirname + '/../Entities/Compact');

    fixture.pathes = new PathesConfiguration(
    {
        root: fixture.basePath,
        sitesTemplate: '${root}',
        siteTemplate: '${sites}/${site.name.toLowerCase()}',
        entityCategoryTemplate: '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}',
        entityIdTemplate: '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}/${entityCategory.shortName}${entityId.number.format(3)}-${entityId.name}',
        entityIdGlobalTemplate: '${sites}/${site.name.toLowerCase()}/${entityCategory.pluralName.toLowerCase()}'
    });

    fixture.categoryElement = new EntityCategory('Element');
    fixture.categoryModule = new EntityCategory('Module');
    fixture.categoryModuleGroup = new EntityCategory('Module Group', undefined, 'g');
    fixture.categoryCommon = new EntityCategory('Common', 'Common', 'c', true);
    fixture.categoriesRepository = new EntityCategoriesRepository();
    fixture.categoriesRepository.add(fixture.categoryElement);
    fixture.categoriesRepository.add(fixture.categoryModule);
    fixture.categoriesRepository.add(fixture.categoryModuleGroup);
    fixture.categoriesRepository.add(fixture.categoryCommon);

    fixture.sitesLoader = new SitesLoader(fixture.pathes);
    fixture.sitesRepository = new SitesRepository(fixture.sitesLoader);

    fixture.entityIdParser = new CompactIdParser(fixture.sitesRepository, fixture.categoriesRepository);

    fixture.entitiesLoader = new EntitiesLoader(fixture.sitesRepository, fixture.categoriesRepository, fixture.entityIdParser, fixture.pathes);
    fixture.entitiesRepository = new EntitiesRepository(fixture.entityIdParser, fixture.entitiesLoader);

    fixture.reset = function()
    {
        fs.emptyDirSync(fixture.basePath + '/default');
    }

    fixture.copy = function(pth)
    {
        fs.copySync(path.resolve(fixture.sourcePath + pth), path.resolve(fixture.basePath + pth));
    }

    fixture.mkdir = function(pth)
    {
        const p = path.resolve(fixture.basePath + pth);
        //console.log('mkdir', p);
        fs.mkdirpSync(p);
    }

    fixture.rename = function(oldPth, newPth)
    {
        //console.log('rename', oldPth, newPth)
        fs.renameSync(path.resolve(fixture.basePath + oldPth), path.resolve(fixture.basePath + newPth));
    }

    return fixture;
}


/**
 * Exports
 */
module.exports.createFixture = createFixture;
