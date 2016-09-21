"use strict";

/**
 * Requirements
 */
const DocumentationBase = require(SOURCE_ROOT + '/model/documentation/DocumentationBase.js').DocumentationBase;
const documentationBaseShared = require('./DocumentationBaseShared.js').spec;


/**
 * Spec
 */
describe(DocumentationBase.className, function()
{
    documentationBaseShared(DocumentationBase, 'model.documentation/DocumentationBase');
});
