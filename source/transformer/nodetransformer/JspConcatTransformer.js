'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const NodeIterator = require('../NodeIterator.js').NodeIterator;


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
    transformNode(node, options)
    {
        if (node.type === 'ExpressionNode')
        {
            const it = new NodeIterator(node);
            while (it.next())
            {
                if (it.find('LiteralNode', { valueType: 'string' }, 3) &&
                    it.nextNode &&
                    it.nextNode.isNode('OperandNode', { value: ['+']}))
                {
                    this.logger.debug('transformNode - changing + for strings to +=')
                    it.nextNode.value = '+=';
                }
            }
        }
        return node;
    }
}

module.exports.JspConcatTransformer = JspConcatTransformer;
