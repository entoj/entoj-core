'use strict';

/**
 * Requirements
 * @ignore
 */
const ValueNode = require('./ValueNode.js').ValueNode;


/**
 *
 */
class BooleanOperandNode extends ValueNode
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/BooleanOperandNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.BooleanOperandNode = BooleanOperandNode;
