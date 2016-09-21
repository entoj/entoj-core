'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const StyleguidePage = require('./StyleguidePage.js').StyleguidePage;
const EntitiesRepository = require('../entity/EntitiesRepository.js').EntitiesRepository;
const assertParameter = require('../../utils/assert.js').assertParameter;
const co = require('co');


/**
 * @class
 * @memberOf site
 * @extends {Base}
 */
class StyleguideRepository extends Base
{
    /**
     * @param {StyleguidePage} rootPage
     * @param {EntitiesRepository} entitiesRepository
     */
    constructor(rootPage, entitiesRepository, entityIdParser)
    {
        super();

        // Check params
        assertParameter(this, 'rootPage', rootPage, true, StyleguidePage);
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        //assertParameter(this, 'entityIdParser', entityIdParser, true, EntityIdParser);

        // Assign
        this._rootPage = rootPage;
        this._entitiesRepository = entitiesRepository;
        this._entityIdParser = entityIdParser;
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.styleguide/StyleguideRepository';
    }


    /**
     * @property {StyleguidePage}
     */
    get rootPage()
    {
        return this._rootPage;
    }


    /**
     * @property {EntitiesRepository}
     */
    get entitiesRepository()
    {
        return this._entitiesRepository;
    }


    /**
     * @property {EntityIdParser}
     */
    get entityIdParser()
    {
        return this._entityIdParser;
    }


    /**
     * @param {String} url
     */
    findPageByUrl(url)
    {
        //Check root
        if (!this.rootPage)
        {
            return Promise.resolve(false);
        }
        if (url === '' || url === this.rootPage.url)
        {
            return Promise.resolve(this.rootPage);
        }

        // Recursive resolver
        const resolver = function(page)
        {
            if (url == page.url)
            {
                return page;
            }
            for (const child of page.children)
            {
                const resolved = resolver(child);
                if (resolved)
                {
                    return resolved;
                }
            }
            return false;
        };

        // Check children
        return Promise.resolve(resolver(this.rootPage));
    }


    /**
     * @param {Object} query
     */
    findDocumentationBy(query)
    {
        const scope = this;
        const promise = co(function*()
        {
            //Check repository
            if (!scope.entitiesRepository)
            {
                return false;
            }

            // Get entities
            const entities = yield scope.entitiesRepository.getItems();
            /*
            if (query.entityId)
            {
                let entityId = query.entityId;
                if (typeof entityId === 'string'))
                {
                    entityId = yield this._entityIdParser.parse(entityId);
                }
                entities = yield scope.entitiesRepository.getItems();
            }
            else
            {
                entities = yield scope.entitiesRepository.getItems();
            }
            */

            // Query
            const result = [];
            for (const entity of entities)
            {
                for (const documentation of entity.documentation)
                {
                    let match = true;

                    // Check contentType
                    if (match && query.contentType && query.contentType != documentation.contentType)
                    {
                        match = false;
                    }

                    // Check class
                    if (match && query.class && !(documentation instanceof query.class))
                    {
                        match = false;
                    }

                    // Add to result
                    if (match)
                    {
                        result.push(documentation);
                    }
                }
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
module.exports.StyleguideRepository = StyleguideRepository;
