'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseLinter = require('./BaseLinter.js').BaseLinter;
const CLIEngine = require('eslint/lib/cli-engine');


/**
 * A javascript linter
 */
class JsLinter extends BaseLinter
{
    /**
     * @param {Object} options
     */
    constructor(rules, options)
    {
        super();

        const opts = options || {};
        this._rules = rules || {};
        const linterOptions =
        {
            useEslintrc: opts.useDefaultConfigs || false
        };
        if (Object.keys(this._rules).length)
        {
            linterOptions.rules = this._rules;
        }
        if (!opts.useDefaultConfigs)
        {
            linterOptions.envs = opts.envs || ['es6', 'browser', 'amd'];
            linterOptions.globals = opts.globals || ['window: true'];
            if (opts.ecmaFeatures)
            {
                linterOptions.parserOptions.ecmaFeatures = opts.ecmaFeatures;
            }
        }
        this._linter = new CLIEngine(linterOptions);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['linter/JsLinter.rules', 'linter/JsLinter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'linter/JsLinter';
    }


    /**
     * @inheritDoc
     */
    get rules()
    {
        return this._rules;
    }


    /**
     * @param {string} content
     * @param {string} options
     * @returns {Promise<Array>}
     */
    lint(content, options)
    {
        if (!content || content.trim() === '')
        {
            return Promise.resolve({ success: true, errorCount: 0, warningCount: 0, messages:[] });
        }

        const linted = this._linter.executeOnText(content);
        const result =
        {
            success: (linted.errorCount == 0 && linted.warningCount == 0),
            errorCount: linted.errorCount,
            warningCount: linted.warningCount,
            messages: linted.results[0].messages
        };

        const opts = options || {};
        const scope = this;
        result.messages = result.messages.map(function(message)
        {
            if (opts.filename)
            {
                message.filename = opts.filename;
            }
            message.linter = scope.className;
            return message;
        });

        return Promise.resolve(result);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JsLinter = JsLinter;
