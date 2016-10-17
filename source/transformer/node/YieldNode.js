'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class YieldNode extends BaseNode
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/YieldNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.YieldNode = YieldNode;
