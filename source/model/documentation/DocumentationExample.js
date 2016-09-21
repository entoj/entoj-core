
'use strict';

/**
 * Requirements
 * @ignore
 */
const DocumentationBase = require('./DocumentationBase.js').DocumentationBase;


/**
 * @memberOf model.documentation
 */
class DocumentationExample extends DocumentationBase
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationExample';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationExample = DocumentationExample;
