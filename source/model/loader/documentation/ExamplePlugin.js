'use strict';

/**
 * Requirements
 * @ignore
 */
const ParserPlugin = require('./ParserPlugin.js').ParserPlugin;
const PathesConfiguration = require('../../configuration/PathesConfiguration.js').PathesConfiguration;
const ExampleFileParser = require('../../../parser/documentation/ExampleFileParser.js').ExampleFileParser;

/**
 * Reads example files
 */
class ExamplePlugin extends ParserPlugin
{
    /**
     * @param {configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(pathesConfiguration, options)
    {
        super(pathesConfiguration);

        // Assign options
        this._parser = new ExampleFileParser(options);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'model.loader.documentation/ExamplePlugin.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader.documentation/ExamplePlugin';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ExamplePlugin = ExamplePlugin;
