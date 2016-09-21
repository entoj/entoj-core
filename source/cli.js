'use strict';

const Context = require('./application/index.js').Context;
const Runner = require('./application/index.js').Runner;

// Check for local configuration
let configuration = {};
if (process.argv.length > 1 && process.argv[process.argv.length - 2] == '--configuration')
{
    const filename = process.argv[process.argv.length - 1];
    configuration = require(filename);
}

// Add cli configuration
const parameters = process.argv.splice(2);
configuration.parameters = require('minimist')(parameters);

// Create context & run commands
const context = new Context(configuration);
const runner = context.di.create(Runner);
runner.run(parameters);
