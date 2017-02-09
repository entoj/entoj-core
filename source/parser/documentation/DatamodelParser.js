'use strict';
/* eslint no-cond-assign:0 */

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;
const DocBlockParser = require('./DocBlockParser.js').DocBlockParser;
const DocumentationDatamodel = require('../../model/documentation/DocumentationDatamodel.js').DocumentationDatamodel;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');
const co = require('co');

/**
 * A json to documentation parser
 */
class DatamodelParser extends Parser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        this._parser = new DocBlockParser();
    }

    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/DatamodelParser';
    }


    /**
     * @param {string} content
     * @param {string} options
     * @returns {Promise<Array>}
     */

    parse(content, options)
    {
        if (!content || content.trim() === '')
        {
            Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function*()
        {
            // Prepare
            let result;

            result = new DocumentationDatamodel();

            // Set kind and type
            result.contentKind = ContentKind.DATAMODEL;
            result.contentType = ContentType.JSON;

            return result;
        })
        .catch(function(error)
        {
            throw new Error('DatamodelParser - ' + error);
        });

        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DatamodelParser = DatamodelParser;
