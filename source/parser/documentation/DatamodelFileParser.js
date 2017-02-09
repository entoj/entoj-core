'use strict';

/**
 * Requirements
 * @ignore
 */
const FileParser = require('../FileParser.js').FileParser;
const DatamodelParser = require('./DatamodelParser.js').DatamodelParser;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');


/**
 * A datamodel to documentation parser
 */
class DatamodelFileParser extends FileParser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        const opts = options || {};
        this._parser = new DatamodelParser(opts);
        this._glob = opts.glob || ['/models/*.json'];
        this._fileType = opts.fileType || ContentType.JSON;
        this._fileKind = opts.fileKind || ContentKind.DATAMODEL;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/DatamodelFileParser';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DatamodelFileParser = DatamodelFileParser;
