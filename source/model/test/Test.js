'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;


/**
 * Describes a Test
 *
 * @memberOf model.test
 */
class Test extends Base
{
    /**
     * @param {string} name
     */
    constructor(name, ok, failed, tests, site)
    {
        super();

        // Add initial values
        this.name = name || 'default';
        this.ok = ok || 0;
        this.failed = failed || 0;
        this.tests = tests || [];
        this.site = site || false;
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.test/Test';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Test = Test;
