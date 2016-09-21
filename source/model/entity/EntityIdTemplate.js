'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const IdParser = require('../../parser/entity/IdParser.js').IdParser;
const assertParameter = require('../../utils/assert.js').assertParameter;
const templateString = require('es6-template-strings');


/**
 *
 */
class EntityIdTemplate extends Base
{
    /**
     *
     */
    constructor(idParser, options)
    {
        super();

        //Check params
        assertParameter(this, 'idParser', idParser, true, IdParser);

        // Assign options
        this._idParser = idParser;
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [IdParser, 'model.entity/EntityIdTemplate.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.entity/EntityIdTemplate';
    }


    /**
     * @param {EntityId} entityId
     * @returns {String}
     */
    id(entityId)
    {
        if (!entityId)
        {
            return '';
        }

        const data =
        {
            entityId: entityId,
            entityCategory: entityId.category,
            site: entityId.site
        };
        const template = entityId.isGlobal ? this._idParser.getTemplate(IdParser.TEMPLATE_CATEGORY) : this._idParser.getTemplate(IdParser.TEMPLATE_ID);
        return templateString(template, data);
    }


    /**
     * @param {EntityId} entityId
     * @returns {String}
     */
    path(entityId)
    {
        if (!entityId)
        {
            return '';
        }

        const data =
        {
            entityId: entityId,
            entityCategory: entityId.category,
            site: entityId.site
        };
        const template = entityId.isGlobal ? this._idParser.getTemplate(IdParser.TEMPLATE_CATEGORY_PATH) : this._idParser.getTemplate(IdParser.TEMPLATE_ID_PATH);
        return templateString(template, data);
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className}]`;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.EntityIdTemplate = EntityIdTemplate;

