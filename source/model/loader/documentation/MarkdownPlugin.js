'use strict';

/**
 * Requirements
 * @ignore
 */
const ParserPlugin = require('./ParserPlugin.js').ParserPlugin;
const PathesConfiguration = require('../../configuration/PathesConfiguration.js').PathesConfiguration;
const MarkdownFileParser = require('../../../parser/documentation/MarkdownFileParser.js').MarkdownFileParser;

/**
 * Reads markdown files
 */
class MarkdownPlugin extends ParserPlugin
{
    /**
     * @param {configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(pathesConfiguration, options)
    {
        super(pathesConfiguration);

        // Assign options
        this._parser = new MarkdownFileParser(options);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'model.loader.documentation/MarkdownPlugin.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader.documentation/MarkdownPlugin';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.MarkdownPlugin = MarkdownPlugin;
