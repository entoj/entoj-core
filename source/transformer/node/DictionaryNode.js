'use strict';

/**
 * Requirements
 * @ignore
 */
const ValueNode = require('./ValueNode.js').ValueNode;


/**
 *
 */
class DictionaryNode extends ValueNode
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/DictionaryNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DictionaryNode = DictionaryNode;
