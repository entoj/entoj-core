/* eslint no-console:0 */
'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const columnify = require('columnify');
const chalk = require('chalk');
const strip = require('strip-ansi');
const shorten = require('../utils/string.js').shortenLeft;
const isPlainObject = require('../utils/objects.js').isPlainObject;
const util = require('util');
require('date-format-lite');


/**
 * Levels:
 *     0 - all
 *     1 - no debug
 *     2 - no info, no options
 * @memberOf command
 */
class CliLogger extends Base
{
    /**
     * @param {Context} context
     */
    constructor(prefix, options)
    {
        super();

        const opts = options || {};
        this._prefix = prefix || '';
        this._state = new Map();
        this._showTimestamp = opts.showTimestamp || true;
        this._showPrefix = opts.showPrefix || true;
        this._prefixLength = opts.prefixLength || 20;
        this._lineLength = process.stdout.columns || 80;
        this._muted = opts.muted || false;
        this._level = opts.level || 0;
        this._id = 0;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        /* istanbul ignore next */
        return { 'parameters': ['cli/CliLogger.prefix', 'cli/CliLogger.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'cli/CliLogger';
    }


    /**
     * @property {bool}
     */
    get muted()
    {
        return this._muted;
    }


    /**
     */
    set muted(value)
    {
        this._muted = value || false;
    }


    /**
     * @param {*} ...
     * @returns {void}
     */
    write()
    {
        if (this._muted)
        {
            return;
        }

        // Message
        const message = Array.from(arguments).join(' ');
        let prepend = '';

        // Timestamp
        if (this._showTimestamp)
        {
            const now = new Date();
            prepend+= chalk.bgBlack(chalk.gray('[' + now.format('hh:mm:ss') + '] '));
        }

        // Prefix
        if (this._showPrefix && this._prefix)
        {
            const prefix = shorten(this._prefix, this._prefixLength);
            prepend+= chalk.gray(prefix + ' '.repeat(Math.max(0, this._prefixLength - prefix.length)) + ' ');
        }

        // Output
        console.log(chalk.bgBlack(prepend) + ' ' + message);
    }


    /**
     * @protected
     * @param {string} message
     * @returns {string}
     */
    formatMessage(message)
    {
        message = message.replace(/<([^>]+)>/g, chalk.styles.cyan.open + '$1' + chalk.styles.cyan.close);
        return message;
    }


    /**
     * @protected
     * @param {string} message
     * @returns {string}
     */
    formatElapsed(date)
    {
        const elapsed = Date.now() - date;
        return chalk.yellow(' (' + elapsed + 'ms)');
    }


    /**
     * @protected
     * @param {string} message
     * @returns {string}
     */
    formatSection(message, isDone, hasError)
    {
        const dashes = '-'.repeat(Math.max(0, 80 - strip(message).replace(/\<|\>/g, '').length));
        let prefix = '○ ';
        if (isDone)
        {
            prefix = hasError ? '✕ ' : '✓ ';
        }
        return chalk.yellow(prefix + this.formatMessage(message)) + ' ' + chalk.dim(dashes);
    }


    /**
     * @protected
     * @param {string} message
     * @returns {string}
     */
    formatWork(message, hasError)
    {
        const prefix = hasError ? '✕ ' : '✓ ';
        let text = '  ' + prefix + this.formatMessage(message);
        if (hasError)
        {
            text = chalk.red(text);
        }
        else
        {
            text = chalk.green(text);
        }
        return text;
    }


    /**
     * @param {string} name
     * @returns {string}
     */
    section()
    {
        const message = Array.from(arguments).join(' ');
        const state =
        {
            id: this._id++,
            type: 'section',
            message: message,
            started: Date.now()
        };
        this._state.set(state.id, state);
        this.write(this.formatSection(message));
        return state.id;
    }


    /**
     * @param {string} name
     * @returns {string}
     */
    work()
    {
        const message = Array.from(arguments).join(' ');
        const state =
        {
            id: this._id++,
            type: 'work',
            message: message,
            started: Date.now()
        };
        this._state.set(state.id, state);
        return state.id;
    }


    /**
     * @param {string} name
     * @returns {string}
     */
    end(id, error, overrideMessage)
    {
        if (!this._state.has(id))
        {
            return;
        }
        const state = this._state.get(id);
        this._state.delete(id);

        let message = '';
        if (state.type === 'section')
        {
            message = this.formatSection(overrideMessage || state.message, true, Boolean(error));
        }
        if (state.type === 'work')
        {
            message = this.formatWork(overrideMessage || state.message, Boolean(error));
        }

        if (error)
        {
            this.write(chalk.red(message));
            if (typeof error === 'string')
            {
                this.write('    ' + chalk.red(error));
            }
        }
        else
        {
            this.write(message + this.formatElapsed(state.started));
        }
    }


    /**
     * @param {string} name
     * @returns {string}
     */
    options(values)
    {
        if (this._level > 2)
        {
            return;
        }
        this.write('  Options');
        for (const key in values)
        {
            if (isPlainObject(values[key]))
            {
                const lines = util.inspect(values[key]).split('\n');
                this.write('    ' + key + ': ' + chalk.cyan(lines.shift()));
                while(lines.length)
                {
                    this.write('        ' + chalk.cyan(lines.shift()));
                }
            }
            else
            {
                this.write('    ' + key + ': ' + chalk.cyan(values[key]));
            }
        }
    }


    /**
     * @param {string} name
     * @returns {string}
     */
    info()
    {
        if (this._level > 2)
        {
            return;
        }
        const message = Array.from(arguments).join(' ');
        this.write(chalk.white('  ' + this.formatMessage(message)));
    }


    /**
     * @param {array} data
     * @returns {void}
     */
    error()
    {
        const args = Array.from(arguments);
        let messages = [];
        if (args[0] instanceof Error)
        {
            messages = messages.concat(args[0].stack.split('\n'));
        }
        else
        {
            messages = messages.concat(args.join(' ').split('\n'));
        }
        for (const message of messages)
        {
            this.write(chalk.red('  ' + this.formatMessage(message)));
        }
    }


    /**
     * @param {array} data
     * @returns {void}
     */
    table(data, options)
    {
        const opts = options || {};
        opts.preserveNewLines = true;
        opts.showHeaders = false;
        opts.columnSplitter = '  ';
        const table = columnify(data, opts);
        const lines = table.split('\n');
        for (const line of lines)
        {
            this.write(this.formatMessage(line));
        }
    }


    /**
     * @param {array} data
     * @returns {void}
     */
    createPrefixed(prefix)
    {
        const options =
        {
            showTimestamp: this._showTimestamp,
            showPrefix: this._showPrefix,
            prefixLength: this._prefixLength,
            muted: this._muted,
            level: this._level
        };
        return new CliLogger(prefix, options);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CliLogger = CliLogger;
