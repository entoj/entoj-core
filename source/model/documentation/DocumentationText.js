
'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationBase = require('./DocumentationBase.js').DocumentationBase;
const DocumentationTextSection = require('./DocumentationTextSection.js').DocumentationTextSection;

/**
 * @memberOf model.documentation
 */
class DocumentationText extends DocumentationBase
{
    /**
     */
    constructor()
    {
        super();

        // Add initial values
        this._sections = [];
        this._tokens = [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationText';
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
    get sections()
    {
        return this._sections;
    }

    set sections(value)
    {
        this._sections = value;
    }


    /**
     * @param {string} name
     * @returns {DocumentationTextSection}
     */
    getByName(name)
    {
        return this.sections.find(item => item.name === name);
    }


    /**
     * @property {string}
     */
    get description()
    {
        return this.getByName(DocumentationTextSection.DESCRIPTION);
    }


    /**
     * @property {string}
     */
    get functional()
    {
        return this.getByKind(DocumentationTextSection.FUNCTIONAL);
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
module.exports.DocumentationText = DocumentationText;
