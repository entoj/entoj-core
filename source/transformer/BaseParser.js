'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Template Renderer
 */
class BaseParser extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/BaseParser';
    }


    /**
     */
    parse(source)
    {
        return false;
    }
}


module.exports.BaseParser = BaseParser;
