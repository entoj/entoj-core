'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;


/**
 *
 */
class GroupNode extends NodeList
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/GroupNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.GroupNode = GroupNode;
