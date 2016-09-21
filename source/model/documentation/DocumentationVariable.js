'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationCode = require('./DocumentationCode.js').DocumentationCode;

/**
 * @memberOf model.documentation
 */
class DocumentationVariable extends DocumentationCode
{
    /**
     */
    constructor()
    {
        super();

        // Add initial values
        this._enumeration = [];
        this._type= [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationVariable';
    }


    /**
     * @property {Array}
     */
    get type()
    {
        return this._type;
    }

    set type(value)
    {
        this._type = value;
    }


    /**
     * @property {Array}
     */
    get enumeration()
    {
        return this._enumeration;
    }

    set enumeration(value)
    {
        this._enumeration = value;
    }


    /**
     * @property {*}
     */
    get value()
    {
        return this._value;
    }

    set value(value)
    {
        this._value = value;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationVariable = DocumentationVariable;
