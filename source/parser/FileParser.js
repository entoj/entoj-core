'use strict';

/**
 * Requirements
 * @ignore
 */
const Parser = require('./Parser.js').Parser;
const File = require('../model/file/File.js').File;
const ContentType = require('../model/ContentType.js');
const ContentKind = require('../model/ContentKind.js');
const glob = require('../utils/glob.js');
const co = require('co');

/**
 * Reads files based on glob patterns
 */
class FileParser extends Parser
{
    /**
     * @param {object|undefined} options
     */
    constructor(options)
    {
        super();

        // Assign options
        const opts = options || {};
        this._parser = opts.parser || undefined;
        this._glob = opts.glob || [];
        this._fileType = opts.fileType || ContentType.ANY;
        this._fileKind = opts.fileKind || ContentKind.UNKNOWN;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['parser/FileParser.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser/FileParser';
    }


    /**
     * @property {Array}
     */
    get glob()
    {
        return this._glob;
    }


    /**
     * @property {Array}
     */
    get fileType()
    {
        return this._fileType;
    }


    /**
     * @property {Array}
     */
    get fileKind()
    {
        return this._fileKind;
    }


    /**
     * Parses a file
     *
     * @protected
     * @param {model.file.File} file
     * @returns {Promise.<Array>}
     */
    parseFile(file)
    {
        if (!this._parser)
        {
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function*()
        {
            // Parse
            let result = yield scope._parser.parse(file.contents);
            if (!Array.isArray(result))
            {
                result = [result];
            }

            // Add file
            for (const documentation of result)
            {
                documentation.file = file;
                if (!documentation.name)
                {
                    documentation.name = file.basename;
                }
            }

            return result;
        });

        return promise;
    }


    /**
     * @inheritDocs
     */
    parse(content, options)
    {
        const scope = this;
        const result =
        {
            files: [],
            items: []
        };
        const promise = co(function*()
        {
            // Options
            const opts = options || {};

            // Get files
            const root = content || '/';
            const fileType = opts.fileType || scope.fileType;
            const fileKind = opts.fileKind || scope.fileKind;
            const globs = opts.glob || scope.glob || [];
            const files = yield glob(globs, { root: root });
            if (!files || !files.length)
            {
                return result;
            }

            // Read & parse
            for (const filename of files)
            {
                const file = new File(filename, fileType, fileKind);
                result.files.push(file);
                if (file.contents)
                {
                    const items = yield scope.parseFile(file);
                    if (items)
                    {
                        Array.prototype.push.apply(result.items, items);
                    }
                }
            }

            return result;
        })
        .catch(function(error)
        {
            throw new Error('FileParser (filename: ' + content + ') - ' + error);
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.FileParser = FileParser;
