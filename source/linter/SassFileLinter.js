'use strict';

/**
 * Requirements
 * @ignore
 */
const FileLinter = require('./FileLinter.js').FileLinter;
const SassLinter = require('./SassLinter.js').SassLinter;


/**
 * A sass file linter
 */
class SassFileLinter extends FileLinter
{
    /**
     * @param {Object} options
     */
    constructor(rules, options)
    {
        super(options);

        const opts = options || {};
        this._linter = new SassLinter(rules || {}, options);
        this._glob = opts.glob || ['/sass/*.scss'];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['linter/SassFileLinter.rules', 'linter/SassFileLinter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'linter/SassFileLinter';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.SassFileLinter = SassFileLinter;
