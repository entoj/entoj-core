
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

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const chaiSubset = require("chai-subset");
chai.use(chaiSubset);

const chaiString = require("chai-string");
chai.use(chaiString);

/**
 * Configure intel
 */
const intel = require('intel');
const logger = intel.getLogger('entoj');
logger.setLevel(intel.ERROR);

/**
 * Configure fixtures
 */
global.fixtures = {};
