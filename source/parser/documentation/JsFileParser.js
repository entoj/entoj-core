'use strict';

/**
 * Requirements
 * @ignore
 */
const FileParser = require('../FileParser.js').FileParser;
const JsParser = require('./JsParser.js').JsParser;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');


/**
 * A js to documentation parser
 */
class JsFileParser extends FileParser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        const opts = options || {};
        this._parser = new JsParser(opts);
        this._glob = opts.glob || ['/js/*.js'];
        this._fileType = opts.fileType || ContentType.JS;
        this._fileKind = opts.fileKind || ContentKind.JS;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/JsFileParser';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JsFileParser = JsFileParser;
