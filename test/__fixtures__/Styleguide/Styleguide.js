"use strict";

/**
 * Requirements
 */
const configuration = require('./build/configuration.js');


/**
 * Creates a complete fixture
 */
function createFixture()
{
    let fixture = {};

    fixture.configuration = configuration;

    return fixture;
}


/**
 * Exports
 */
module.exports.createFixture = createFixture;