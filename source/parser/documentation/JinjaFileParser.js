'use strict';

/**
 * Requirements
 * @ignore
 */
const FileParser = require('../FileParser.js').FileParser;
const JinjaParser = require('./JinjaParser.js').JinjaParser;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');


/**
 * A jinja to documentation parser
 */
class JinjaFileParser extends FileParser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        const opts = options || {};
        this._parser = new JinjaParser(opts);
        this._glob = opts.glob || ['/*.j2', '/macros/*.j2'];
        this._fileType = opts.fileType || ContentType.JINJA;
        this._fileKind = opts.fileKind || ContentKind.MACRO;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/JinjaFileParser';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JinjaFileParser = JinjaFileParser;
