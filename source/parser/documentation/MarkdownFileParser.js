'use strict';

/**
 * Requirements
 * @ignore
 */
const FileParser = require('../FileParser.js').FileParser;
const MarkdownParser = require('./MarkdownParser.js').MarkdownParser;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');


/**
 * A markdown to documentation parser
 */
class MarkdownFileParser extends FileParser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        const opts = options || {};
        this._parser = new MarkdownParser(opts);
        this._glob = opts.glob || ['/*.md'];
        this._fileType = opts.fileType || ContentType.MARKDOWN;
        this._fileKind = opts.fileKind || ContentKind.TEXT;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/MarkdownFileParser';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.MarkdownFileParser = MarkdownFileParser;
