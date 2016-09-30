"use strict";

/**
 * Requirements
 */
const configuration = require('./build/configuration.js');
const Context = require(SOURCE_ROOT + '/application/Context.js').Context;


/**
 * Creates a complete fixture
 */
function createFixture()
{
    let fixture = {};

    fixture.configuration = configuration;
    fixture.context = new Context(configuration);

    return fixture;
}


/**
 * Exports
 */
module.exports.createFixture = createFixture;

