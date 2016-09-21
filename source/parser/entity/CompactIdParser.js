'use strict';


/**
 * Requirements
 * @ignore
 */
const IdParser = require('./IdParser.js').IdParser;
const EntityCategoriesRepository = require('../../model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const EntityCategory = require('../../model/entity/EntityCategory.js').EntityCategory;
const EntityId = require('../../model/entity/EntityId.js').EntityId;
const EntityIdTemplate = require('../../model/entity/EntityIdTemplate.js').EntityIdTemplate;
const SitesRepository = require('../../model/site/SitesRepository.js').SitesRepository;
const Site = require('../../model/site/Site.js').Site;
const assertParameter = require('../../utils/assert.js').assertParameter;
const urlify = require('../../utils/urls.js').urlify;
const XRegExp = require('xregexp');
const co = require('co');


/**
 * A entity compact id parser
 */
class CompactIdParser extends IdParser
{
    /**
     * @param {SitesRepository} sitesRepository
     * @param {EntityCategoriesRepository} entityCategoriesRepository
     */
    constructor(sitesRepository, entityCategoriesRepository, options)
    {
        super();

        //Check params
        assertParameter(this, 'sitesRepository', sitesRepository, true, SitesRepository);
        assertParameter(this, 'entityCategoriesRepository', entityCategoriesRepository, true, EntityCategoriesRepository);

        // Assign options
        const opts = options || {};
        this._sitesRepository = sitesRepository;
        this._entityCategoriesRepository = entityCategoriesRepository;
        this._idTemplate = new EntityIdTemplate(this);
        this._useNumbers = (typeof opts.useNumbers === 'undefined') ? true : opts.useNumbers;

        // Build templates
        this._templates = {};
        this._templates[IdParser.TEMPLATE_SITE] = opts.TEMPLATE_SITE || '${site.name.urlify()}';
        this._templates[IdParser.TEMPLATE_CATEGORY] = opts.TEMPLATE_CATEGORY || '${entityCategory.pluralName.urlify()}';
        const id = this._useNumbers ? '${entityCategory.shortName.urlify()}${entityId.number.format(3)}-${entityId.name.urlify()}'
                                    : '${entityCategory.shortName.urlify()}-${entityId.name.urlify()}';
        this._templates[IdParser.TEMPLATE_ID] = opts.TEMPLATE_ID || id;
        this._templates[IdParser.TEMPLATE_SITE_PATH] = '/' + this._templates[IdParser.TEMPLATE_SITE];
        this._templates[IdParser.TEMPLATE_CATEGORY_PATH] = this._templates[IdParser.TEMPLATE_SITE_PATH] + '/' + this._templates[IdParser.TEMPLATE_CATEGORY];
        this._templates[IdParser.TEMPLATE_ID_PATH] = this._templates[IdParser.TEMPLATE_CATEGORY_PATH] + '/' + this._templates[IdParser.TEMPLATE_ID];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [SitesRepository, EntityCategoriesRepository, 'parser.entity/CompactIdParser.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.entity/CompactIdParser';
    }


    /**
     * @inheritDoc
     */
    getTemplate(type)
    {
        return this._templates[type] || '#ERROR#';
    }


    /**
     * @param {string} content
     * @param {string} options
     * @returns {Promise<*>}
     */
    parse(content, options)
    {
        if (!content || content.trim() === '')
        {
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function*()
        {
            // Get category names
            let categoriesShort = yield scope._entityCategoriesRepository.getPropertyList(EntityCategory.SHORT_NAME);
            let categoriesPlural = yield scope._entityCategoriesRepository.getPropertyList(EntityCategory.PLURAL_NAME);
            categoriesShort = categoriesShort.map(item => urlify(item));
            categoriesPlural = categoriesPlural.map(item => urlify(item));

            // Prepare content
            const id = content.replace(/\\/g, '/');

            // Prepare pattern
            let pattern = '({{site}})? \\/? ({{category}})? \\/? ({{categoryShort}}) ({{number}}) - ({{name}})'
            if (!scope._useNumbers)
            {
                pattern = '({{site}})? \\/? ({{category}})? \\/? ({{categoryShort}}) - ({{name}})';
            }

            // Match entity
            let regex = XRegExp.build(pattern,
                {
                    site: /^\w+$/,
                    category: new RegExp('^' + categoriesPlural.join('|') + '$'),
                    categoryShort: new RegExp('^' + categoriesShort.join('|') + '$'),
                    number: /^[0-9]+$/,
                    name: /^\w+$/
                }, 'xi');
            let match = XRegExp.exec(id, regex);

            // Match global category
            if (!match)
            {
                regex = XRegExp.build('({{site}})\\/({{category}})',
                    {
                        site: /^\w+$/,
                        category: new RegExp('^' + categoriesPlural.join('|') + '$')
                    }, 'i');
                match = XRegExp.exec(id, regex);

                if (!match)
                {
                    return false;
                }
            }

            // Prepare result
            const site = yield scope._sitesRepository.findBy(Site.ANY, match.site);
            const entityCategoryName = match.category || match.categoryShort;
            const entityCategory = yield scope._entityCategoriesRepository.findBy(EntityCategory.ANY, match.categoryShort || match.category);
            const entityNumber = parseInt(match.number || '0', 10);
            const result =
            {
                siteName: match.site,
                site: site,
                entityCategoryName: entityCategoryName,
                entityCategory: entityCategory,
                entityNumber: entityNumber,
                entityName: match.name || ''
            };
            if (entityCategory)
            {
                result.entityId = new EntityId(entityCategory, result.entityName, result.entityNumber, result.site, scope._idTemplate);
            }

            return result;
        });

        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CompactIdParser = CompactIdParser;
