
'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationBase = require('./DocumentationBase.js').DocumentationBase;

/**
 * @memberOf model.documentation
 */
class DocumentationTextSection extends DocumentationBase
{
    /**
     *
     */
    static get DESCRIPTION()
    {
        return 'description';
    }


    /**
     *
     */
    static get FUNCTIONAL()
    {
        return 'functional';
    }


    /**
     */
    constructor()
    {
        super();

        // Add initial values
        this._tokens = [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationTextSection';
    }


    /**
     * @property {Array}
     */
    get tokens()
    {
        return this._tokens;
    }

    set tokens(value)
    {
        this._tokens = value;
    }


    /**
     * @property {Array}
     */
    getTokens(skip)
    {
        return this._tokens.slice(skip || 0);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationTextSection = DocumentationTextSection;
