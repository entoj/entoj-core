'use strict';

/**
 * Requirements
 * @ignore
 */
const ValueNode = require('./ValueNode.js').ValueNode;


/**
 *
 */
class ComplexVariableNode extends ValueNode
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/ComplexVariableNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ComplexVariableNode = ComplexVariableNode;
