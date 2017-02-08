
'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationBase = require('./DocumentationBase.js').DocumentationBase;


/**
 * @memberOf model.documentation
 */
class DocumentationDatamodel extends DocumentationBase
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationDatamodel';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationDatamodel = DocumentationDatamodel;
