'use strict';

/**
 * Requirements
 * @ignore
 */
const ParserPlugin = require('./ParserPlugin.js').ParserPlugin;
const PathesConfiguration = require('../../configuration/PathesConfiguration.js').PathesConfiguration;
const SassFileParser = require('../../../parser/documentation/SassFileParser.js').SassFileParser;

/**
 * Reads example files
 */
class SassPlugin extends ParserPlugin
{
    /**
     * @param {configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(pathesConfiguration, options)
    {
        super(pathesConfiguration);

        // Assign options
        this._parser = new SassFileParser(options);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'model.loader.documentation/SassPlugin.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader.documentation/SassPlugin';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.SassPlugin = SassPlugin;
