'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTest = require('../../model/test/Test.js').Test;


/**
 * Describes a Test
 *
 * @memberOf model.site
 */
class Test extends BaseTest
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'cssregression.model/Test';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Test = Test;
