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
     * @private
     */
    walk(node, transformer, options, level)
    {
        level = level || 0;
        this.logger.debug(String('    ').repeat(level), 'Node', node.type);

        for (const field of node.nodeFields)
        {
            if (Array.isArray(node[field]))
            {
                const nodes = [];
                for (const child of node[field])
                {
                    try
                    {
                        nodes.push(this.walk(child, transformer, options, level + 1));
                    }
                    catch(e)
                    {
                        this.logger.error('Walk failed for ', child, e);
                    }
                }
                node[field].load(nodes, true);
            }
            else if (node instanceof BaseNode)
            {
                node[field] = this.walk(node[field], transformer, options, level + 1);
            }
        }
        return this.transformNode(node, options);
    }


    /**
     *
     */
    transform(rootNode, transformer, options)
    {
        if (!rootNode)
        {
            return Promise.resolve(false);
        }
        return Promise.resolve(this.walk(rootNode.clone(), transformer, options));
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.NodeTransformer = NodeTransformer;
