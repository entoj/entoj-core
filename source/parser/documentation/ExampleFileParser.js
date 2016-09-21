'use strict';

/**
 * Requirements
 * @ignore
 */
const FileParser = require('../FileParser.js').FileParser;
const ExampleParser = require('./ExampleParser.js').ExampleParser;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');


/**
 * A example to documentation parser
 */
class ExampleFileParser extends FileParser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        const opts = options || {};
        this._parser = new ExampleParser(opts);
        this._glob = opts.glob || ['/examples/*.j2'];
        this._fileType = opts.fileType || ContentType.JINJA;
        this._fileKind = opts.fileKind || ContentKind.EXAMPLE;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/ExampleFileParser';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ExampleFileParser = ExampleFileParser;
