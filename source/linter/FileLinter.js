'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseLinter = require('./BaseLinter.js').BaseLinter;
const File = require('../model/file/File.js').File;
const glob = require('../utils/glob.js');
const co = require('co');

/**
 * Reads files based on glob patterns
 */
class FileLinter extends BaseLinter
{
    /**
     * @param {object|undefined} options
     */
    constructor(rules, options)
    {
        super();

        // Assign options
        const opts = options || {};
        this._linter = opts.linter || undefined;
        this._glob = opts.glob || [];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['linter/FileLinter.rules', 'linter/FileLinter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'linter/FileLinter';
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
    get linter()
    {
        return this._linter;
    }


    /**
     * Lints a file
     *
     * @protected
     * @param {model.file.File} file
     * @returns {Promise.<Array>}
     */
    lintFile(file, filename)
    {
        if (!this._linter)
        {
            return Promise.resolve({ success: true, warningCount: 0, errorCount: 0, messages: [] });
        }

        return this._linter.lint(file.contents, { filename: filename || file.filename });
    }


    /**
     * @inheritDocs
     */
    lint(content, options)
    {
        const scope = this;
        const promise = co(function*()
        {
            const result =
            {
                success: true,
                warningCount: 0,
                errorCount: 0,
                messages: [],
                files: []
            };

            // Options
            const opts = options || {};

            // Get files
            const root = content || '/';
            const globs = opts.glob || scope.glob || [];
            const files = yield glob(globs, { root: root });
            if (!files || !files.length)
            {
                return result;
            }

            // Read & lint
            for (const filename of files)
            {
                const file = new File(filename);
                result.files.push(file);
                if (file.contents)
                {
                    const lintResult = yield scope.lintFile(file, opts.filename);
                    if (lintResult)
                    {
                        if (!lintResult.success)
                        {
                            result.success = false;
                        }
                        result.warningCount+= lintResult.warningCount;
                        result.errorCount+= lintResult.errorCount;
                        Array.prototype.push.apply(result.messages, lintResult.messages);
                    }
                }
            }

            return result;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.FileLinter = FileLinter;
