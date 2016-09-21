'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationVariable = require('./DocumentationVariable.js').DocumentationVariable;

/**
 * @memberOf model.documentation
 */
class DocumentationParameter extends DocumentationVariable
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationParameter';
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
     * @property {Boolean}
     */
    get isOptional()
    {
        return this._isOptional === true;
    }

    set isOptional(value)
    {
        this._isOptional = value === true;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationParameter = DocumentationParameter;
