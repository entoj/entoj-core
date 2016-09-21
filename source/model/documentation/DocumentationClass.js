'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationCode = require('./DocumentationCode.js').DocumentationCode;

/**
 * @memberOf model.documentation
 */
class DocumentationClass extends DocumentationCode
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationClass';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationClass = DocumentationClass;
