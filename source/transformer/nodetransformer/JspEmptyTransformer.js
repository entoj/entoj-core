'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const NodeIterator = require('../NodeIterator.js').NodeIterator;
const OperandNode = require('../node/OperandNode.js').OperandNode;


/**
 *
 */
class JspEmptyTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspEmptyTransformer';
    }


    /**
     * @inheritDoc
     */
    transformNode(node, options)
    {
        if (node.type === 'ConditionNode')
        {
            const it = new NodeIterator(node);
            while (it.next())
            {
                // if variable then
                // if not variable then
                if ((!it.previousNode || !it.previousNode.is('OperandNode')) &&
                    it.currentNode.is('VariableNode') &&
                    (!it.nextNode || !it.nextNode.is('OperandNode')))
                {
                    this.logger.debug('transformNode - found boolean');
                    node.children.insertBefore(it.currentNode, new OperandNode('empty'));
                }

                // if '' == variable then
                // if '' != variable then
                if (it.find('VariableNode', undefined, 3) &&
                    it.find('LiteralNode', { value: '' }, 3) &&
                    it.nextNode &&
                    it.nextNode.is('OperandNode', { value: ['==', '!='] }))
                {
                    this.logger.debug('transformNode - found comparison');
                    // Add (not) empty
                    if (it.nextNode.value === '!=')
                    {
                        node.children.insertBefore(it.nextNode, new BooleanOperandNode('not'));
                    }
                    node.children.insertBefore(it.nextNode, new OperandNode('empty'));

                    // Remove operand
                    node.remove(it.nextNode);

                    // Remove literal
                    if (it.currentNode.type === 'VariableNode')
                    {
                        node.remove(it.peek(2));
                    }
                    else
                    {
                        result.push(nodeList.peek(2));
                    }

                    //
                    it.refresh();
                }
            }
        }
        return node;
    }
}

module.exports.JspEmptyTransformer = JspEmptyTransformer;
