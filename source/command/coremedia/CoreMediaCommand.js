'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('../BaseCommand.js').BaseCommand;
const Context = require('../../application/Context.js').Context;
const CoreMediaCompiler = require('./CoreMediaCompiler.js').CoreMediaCompiler;
const Transformer = require('../../transformer/Transformer.js').Transformer;
const CoreMediaTransformer = require('../../transformer/CoreMediaTransformer.js').CoreMediaTransformer;


/**
 * @memberOf command.coremedia
 */
class CoreMediaCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context, options)
    {
        super(context);

        // Assign options
        this._name = 'coremedia';
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'command.coremedia/CoreMediaCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command.coremedia/CoreMediaCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Generates CoreMedia template files from entities',
            actions:
            [
                {
                    name: 'compile',
                    description: 'Compiles all CoreMedia templates for the given <query>'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Stream>}
     */
    compile(parameters)
    {
        const mappings = new Map();
        mappings.set(Transformer, CoreMediaTransformer);
        const compiler = this.context.di.create(CoreMediaCompiler, mappings);
        const options =
        {
            query: parameters._[2] || '*',
            path: this._options.path || false,
            beautify: this._options.beautify || true
        };
        return compiler.compile(options);
    }


    /**
     * @inheritDocs
     * @returns {Promise<*>}
     */
    doExecute(parameters)
    {
        return this.compile(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaCommand = CoreMediaCommand;
