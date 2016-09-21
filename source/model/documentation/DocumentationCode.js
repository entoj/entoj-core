'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationBase = require('./DocumentationBase.js').DocumentationBase;

/**
 * @memberOf model.documentation
 */
class DocumentationCode extends DocumentationBase
{
    /**
     */
    constructor()
    {
        super();

        // Add initial values
        this._visibility = 'public';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationCode';
    }


    /**
     * @property {String}
     */
    get namespace()
    {
        return this._namespace;
    }

    set namespace(value)
    {
        this._namespace = value;
    }

    /**
     * @property {String}
     */
    get visibility()
    {
        return this._visibility;
    }

    set visibility(value)
    {
        this._visibility = value;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationCode = DocumentationCode;
