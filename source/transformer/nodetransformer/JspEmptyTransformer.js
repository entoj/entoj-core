'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const NodeIterator = require('../NodeIterator.js').NodeIterator;
const FilterNode = require('../node/FilterNode.js').FilterNode;
const ParametersNode = require('../node/ParametersNode.js').ParametersNode;


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
     * @param variableNode
     * @returns {*|FilterNode}
     * @private
     */
    createEmptyFilterNode(variableNode)
    {
        return new FilterNode('empty', new ParametersNode({}), variableNode);
    }


    /**
     * @param variableNode
     * @returns {*|FilterNode}
     * @private
     */
    createNotEmptyFilterNode(variableNode)
    {
        return new FilterNode('notempty', new ParametersNode({}), variableNode);
    }


    /**
     * @inheritDoc
     */
    transformNode(node, transformer, options)
    {
        if (node.type === 'ConditionNode')
        {
            this.logger.debug('Node Serialized',JSON.stringify(node.serialize(), null, 4));
            const it = new NodeIterator(node);
            while (it.next())
            {
                if (it.currentNode.type != 'FilterNode')
                {
                    // if a -> not empty a
                    if (it.currentNode.type == 'VariableNode' && (!it.nextNode || it.nextNode.type == 'BooleanOperandNode' ))
                    {
                        this.logger.debug('if a',it.currentNode, it.nextNode);
                        node.children.insertAfter(it.currentNode, this.createNotEmptyFilterNode(it.currentNode) );
                        node.children.remove(it.currentNode);
                    }
                    // if not a -> empty a
                    else if (it.currentNode.is('BooleanOperandNode',{ value : ['not'] }) && it.nextNode && it.nextNode.type == 'VariableNode' )
                    {
                        this.logger.debug('if not a',it.currentNode, it.nextNode);
                        const variableNode = it.nextNode;
                        node.children.insertAfter(it.currentNode, this.createEmptyFilterNode(variableNode) );
                        node.children.remove(variableNode);
                        node.children.remove(it.currentNode);
                    }
                    // '' == a -> empty a
                    // '' != a -> not empty a
                    else if (it.currentNode.is('LiteralNode', { value: '' }) && it.find('VariableNode', {}, 3 ))
                    {
                        this.logger.debug('\'\' != / == a',it.currentNode, it.nextNode, it.peek(2));
                        const maybeOperandNode = it.nextNode;
                        const variableNode = it.peek(2);
                        if (maybeOperandNode.is('OperandNode', { value: [ '==', '!=' ]} ))
                        {
                            if (maybeOperandNode.is('OperandNode', { value: [ '==' ]} ))
                            {
                                node.children.insertAfter(it.currentNode, this.createEmptyFilterNode(variableNode) );
                            }
                            else if (maybeOperandNode.is('OperandNode', { value: [ '!=' ]} ))
                            {
                                node.children.insertAfter(it.currentNode, this.createNotEmptyFilterNode(variableNode) );
                            }

                            // Remove old Nodes
                            node.children.remove(it.currentNode);
                            node.children.remove(maybeOperandNode);
                            node.children.remove(variableNode);
                        }
                    }
                    // a == '' -> empty a
                    // a != '' -> not empty a
                    else if (it.currentNode.type == 'VariableNode' && it.find('LiteralNode', { value: '' }, 3 ))
                    {
                        this.logger.debug('a != / == \'\'',it.currentNode, it.nextNode, it.peek(2));
                        const maybeOperandNode = it.nextNode;
                        const variableNode = it.currentNode;
                        if (maybeOperandNode.is('OperandNode', { value: [ '==', '!=' ]} ))
                        {
                            if (maybeOperandNode.is('OperandNode', { value: [ '==' ]} ))
                            {
                                node.children.insertBefore(variableNode, this.createEmptyFilterNode(variableNode) );
                            }
                            else if (maybeOperandNode.is('OperandNode', { value: [ '!=' ]} ))
                            {
                                node.children.insertBefore(variableNode, this.createNotEmptyFilterNode(variableNode) );
                            }

                            // Remove old Nodes
                            node.children.remove(variableNode);
                            node.children.remove(maybeOperandNode);
                            node.children.remove(it.peek(2));
                        }
                    }
                }
            }
        }
        return node;
    }
}

module.exports.JspEmptyTransformer = JspEmptyTransformer;
