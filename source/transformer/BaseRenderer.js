'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * Template Renderer
 */
class BaseRenderer extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/BaseRenderer';
    }


    /**
     */
    render(node)
    {
        return '';
    }
}


module.exports.BaseRenderer = BaseRenderer;
