'use strict';

/**
 * Requirements
 * @ignore
 */
const ValueNode = require('./ValueNode.js').ValueNode;


/**
 *
 */
class TextNode extends ValueNode
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/TextNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TextNode = TextNode;
