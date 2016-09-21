'use strict';

/**
 * Requirements
 */
let Base = require(SOURCE_ROOT + '/Base.js').Base;
let baseSpec = require('./BaseShared.js').spec;


/**
 * Spec
 */
describe(Base.className, function()
{
    baseSpec(Base, 'Base');
});