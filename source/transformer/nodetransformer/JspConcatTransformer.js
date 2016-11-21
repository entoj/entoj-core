'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const NodeIterator = require('../NodeIterator.js').NodeIterator;
const FilterNode = require('../node/FilterNode.js').FilterNode;
const ParametersNode = require('../node/ParametersNode.js').ParametersNode;
const ParameterNode = require('../node/ParameterNode.js').ParameterNode;


/**
 *
 */
class JspConcatTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspConcatTransformer';
    }


    /**
     * @inheritDoc
     */
    transformNode(node, transformer, options)
    {
        if (node.type === 'ExpressionNode')
        {
            const it = new NodeIterator(node);
            while (it.next())
            {
                this.logger.debug('transformNode - checking node ' + it.currentNode.type + ' at ' + it.index);

                // Handles string + x and concat + x
                if ((it.find('LiteralNode', { valueType: 'string' }, 3) ||
                     it.find('FilterNode', { name: 'concat' }, 3) ) &&
                    it.nextNode &&
                    it.nextNode.is('OperandNode', { value: ['+']}))
                {
                    this.logger.debug('transformNode - changing string + x to concat filter');

                    // Get nodes
                    const leftNode = it.currentNode;
                    const operandNode = it.nextNode;
                    const rightNode = it.peek(2);

                    // Create filter
                    const filter = new FilterNode('concat', new ParametersNode([ new ParameterNode(undefined, rightNode) ]), leftNode);
                    node.children.insertBefore(leftNode, filter);

                    // Remove nodes
                    node.children.remove(leftNode);
                    node.children.remove(operandNode);
                    node.children.remove(rightNode);

                    // Rewind iterator
                    it.reset();
                }
            }
        }
        return node;
    }
}

module.exports.JspConcatTransformer = JspConcatTransformer;
