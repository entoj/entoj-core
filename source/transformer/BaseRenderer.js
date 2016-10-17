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
     * @return {Promise}
     */
    render(node)
    {
        return Promise.resolve('');
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BaseRenderer = BaseRenderer;
