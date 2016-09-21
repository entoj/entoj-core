
/**
 * Configure path
 */
const path = require('path');
global.SOURCE_ROOT = path.resolve(__dirname + '/../source');
global.FIXTURES_ROOT = path.resolve(__dirname + '/__fixtures__');

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
 * Configure winston
 */
const winston = require('winston');
winston.loggers.add('cli',
{
    console:
    {
        level: 'error',
        colorize: true,
        label: ''
    }
});
winston.loggers.add('debug',
{
    console:
    {
        level: 'error',
        colorize: true,
        label: ''
    }
});

/**
 * Configure fixtures
 */
global.fixtures = {};
