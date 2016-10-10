'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;


/**
 *
 */
class JspStringConcatTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspStringConcatTransformer';
    }


    /**
     * @inheritDoc
     */
    transformNode(node, options)
    {
        if (node.type == 'ExpressionNode')
        {
            /*
            const nodeList = new TransformerNodes(nodes);
            const result = [];
            let success = false;
            while (nodeList.next())
            {
                if (nodeList.hasNode('VariableNode', false, 3) &&
                    nodeList.hasNode('LiteralNode', { value: '' }, 3) &&
                    nodeList.isNode(nodeList.nextNode, 'OperandNode', { value: ['==', '!=']}))
                {
                    result.push(new OperandNode(nodeList.nextNode.value === '==' ? 'empty' : 'not empty'));
                    if (nodeList.currentNode.type === 'VariableNode')
                    {
                        result.push(nodeList.currentNode);
                    }
                    else
                    {
                        result.push(nodeList.peek(2));
                    }
                    nodeList.next(2);
                    success = true;
                }
                else
                {
                    result.push(nodeList.currentNode);
                }
            }
            */
        }
        return node;
    }
}

module.exports.JspStringConcatTransformer = JspStringConcatTransformer;
