'use strict';

/**
 * Configure parameters
 */
const parameters = require('minimist')(process.argv.splice(2));

/**
 * Configure path
 */
const path = require('path');
global.SOURCE_ROOT = path.resolve(__dirname + '/../source');
global.FIXTURES_ROOT = path.resolve(__dirname + '/__fixtures__');
global.TEST_ROOT = __dirname;

/**
 * Configure chai
 */
const chai = require('chai');
chai.config.includeStack = true;
global.expect = chai.expect;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const chaiSubset = require("chai-subset");
chai.use(chaiSubset);

const chaiString = require("chai-string");
chai.use(chaiString);

const chaiThings = require("chai-things");
chai.use(chaiThings);


/**
 * Configure intel
 */
require(SOURCE_ROOT + '/Base.js'); // Load Base to be able to override the defaults set there
const intel = require('intel');
const logger = intel.getLogger('entoj');
let level = intel.ERROR;
if (parameters.v)
{
    level = intel.WARN;
}
if (parameters.vv)
{
    level = intel.INFO;
}
if (parameters.vvv)
{
    level = intel.DEBUG;
}
if (parameters.vvvv)
{
    level = intel.TRACE;
}
logger.setLevel(level);

/**
 * Configure fixtures
 */
global.fixtures = {};
