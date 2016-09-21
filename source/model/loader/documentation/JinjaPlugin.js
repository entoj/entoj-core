'use strict';

/**
 * Requirements
 * @ignore
 */
const ParserPlugin = require('./ParserPlugin.js').ParserPlugin;
const PathesConfiguration = require('../../configuration/PathesConfiguration.js').PathesConfiguration;
const JinjaFileParser = require('../../../parser/documentation/JinjaFileParser.js').JinjaFileParser;

/**
 * Reads jinja files
 */
class JinjaPlugin extends ParserPlugin
{
    /**
     * @param {configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(pathesConfiguration, options)
    {
        super(pathesConfiguration);

        // Assign options
        this._parser = new JinjaFileParser(options);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'model.loader.documentation/JinjaPlugin.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader.documentation/JinjaPlugin';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JinjaPlugin = JinjaPlugin;
