'use strict';

/**
 * Requirements
 * @ignore
 */
const FileParser = require('../FileParser.js').FileParser;
const SassParser = require('./SassParser.js').SassParser;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');


/**
 * A scss to documentation parser
 */
class SassFileParser extends FileParser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        const opts = options || {};
        this._parser = new SassParser(opts);
        this._glob = opts.glob || ['/*.scss', '/sass/*.scss'];
        this._fileType = opts.fileType || ContentType.SASS;
        this._fileKind = opts.fileKind || ContentKind.CSS;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/SassFileParser';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.SassFileParser = SassFileParser;
