'use strict';

/**
 * Requirements
 * @ignore
 */
const FileLinter = require('./FileLinter.js').FileLinter;
const JsLinter = require('./JsLinter.js').JsLinter;


/**
 * A js file linter
 */
class JsFileLinter extends FileLinter
{
    /**
     * @param {Object} options
     */
    constructor(rules, options)
    {
        super(options);

        const opts = options || {};
        this._linter = new JsLinter(rules || {}, opts);
        this._glob = opts.glob || ['/js/*.js'];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['linter/JsFileLinter.rules', 'linter/JsFileLinter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'linter/JsFileLinter';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JsFileLinter = JsFileLinter;
