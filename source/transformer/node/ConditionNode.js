'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;


/**
 *
 */
class ConditionNode extends NodeList
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/ConditionNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ConditionNode = ConditionNode;
