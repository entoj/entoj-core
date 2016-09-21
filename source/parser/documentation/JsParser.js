'use strict';
/* eslint no-cond-assign:0 */

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;
const DocBlockParser = require('./DocBlockParser.js').DocBlockParser;

/**
 * A js to documentation parser
 */
class JsParser extends Parser
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
        return 'parser.documentation/JsParser';
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

        return Promise.resolve([]);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JsParser = JsParser;
