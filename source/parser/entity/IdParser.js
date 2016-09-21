'use strict';

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;


/**
 * A entity id parser
 */
class IdParser extends Parser
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.entity/IdParser';
    }


    /**
     * @inheritDoc
     */
    static get TEMPLATE_SITE()
    {
        return 'TEMPLATE_SITE';
    }


    /**
     * @inheritDoc
     */
    static get TEMPLATE_CATEGORY()
    {
        return 'TEMPLATE_CATEGORY';
    }


    /**
     * @inheritDoc
     */
    static get TEMPLATE_ID()
    {
        return 'TEMPLATE_ID';
    }


    /**
     * @inheritDoc
     */
    static get TEMPLATE_SITE_PATH()
    {
        return 'TEMPLATE_SITE_PATH';
    }


    /**
     * @inheritDoc
     */
    static get TEMPLATE_CATEGORY_PATH()
    {
        return 'TEMPLATE_CATEGORY_PATH';
    }


    /**
     * @inheritDoc
     */
    static get TEMPLATE_ID_PATH()
    {
        return 'TEMPLATE_ID_PATH';
    }


    /**
     * @returns {EntityIdTemplate}
     */
    get idTemplate()
    {
        return this._idTemplate;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.IdParser = IdParser;
