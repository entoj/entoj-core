'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;


/**
 *
 */
class ArrayNode extends NodeList
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/ArrayNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ArrayNode = ArrayNode;
