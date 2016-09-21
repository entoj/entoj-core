'use strict';

/**
 * Requirements
 * @ignore
 */
const ParserPlugin = require('./ParserPlugin.js').ParserPlugin;
const PathesConfiguration = require('../../configuration/PathesConfiguration.js').PathesConfiguration;
const JsFileParser = require('../../../parser/documentation/JsFileParser.js').JsFileParser;

/**
 * Reads example files
 */
class JsPlugin extends ParserPlugin
{
    /**
     * @param {configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(pathesConfiguration, options)
    {
        super(pathesConfiguration);

        // Assign options
        this._parser = new JsFileParser(options);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'model.loader.documentation/JsPlugin.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader.documentation/JsPlugin';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JsPlugin = JsPlugin;
