'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const BaseNode = require('./node/BaseNode.js').BaseNode;


/**
 * AST Transformer
 */
class NodeTransformer extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/NodeTransformer';
    }


    /**
     *
     */
    transformNode(node, options)
    {
        return node;
    }


    /**
     *
     */
    walk(node, transformer, options, level)
    {
        level = level || 0;
        this.logger.debug(String('    ').repeat(level), 'Node', node.type);

        const result = node.clone();
        for (const field of node.nodeFields)
        {
            if (Array.isArray(node[field]))
            {
                result[field] = Array.isArray(result[field]) ? result[field] : [];
                for (const child of node[field])
                {
                    const childNodes = this.walk(child, transformer, options, level + 1);
                    try
                    {
                        result[field].push(childNodes);
                    }
                    catch(e)
                    {
                        this.logger.error('Walk failed for ', child, e);
                    }
                }
            }
            else if (node instanceof BaseNode)
            {
                result[field] = this.walk(node[field], transformer, options, level + 1);
            }
        }
        return this.transformNode(result, options);
    }


    /**
     *
     */
    transform(rootNode, transformer, options)
    {
        return this.walk(rootNode, transformer, options);
    }
}

module.exports.NodeTransformer = NodeTransformer;
