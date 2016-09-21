'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationParameter = require('./DocumentationParameter.js').DocumentationParameter;

/**
 * @memberOf model.documentation
 */
class DocumentationCompoundParameter extends DocumentationParameter
{
    /**
     */
    constructor()
    {
        super();

        // Add initial values
        this._children = [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationCompoundParameter';
    }


    /**
     * @property {String}
     */
    get defaultValue()
    {
        return this._defaultValue;
    }

    set defaultValue(value)
    {
        this._defaultValue = value;
    }


    /**
     * @property {String}
     */
    get children()
    {
        return this._children;
    }

    set children(value)
    {
        this._children = value;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationCompoundParameter = DocumentationCompoundParameter;
