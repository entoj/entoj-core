'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const NodeList = require('../node/NodeList.js').NodeList;


/**
 *
 */
class JspPreferYieldTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspPreferYieldTransformer';
    }


    /**
     * @inheritDoc
     */
    transformNode(node, transformer, options)
    {
        // Remove if caller then else
        if (node.is('IfNode') &&
            node.condition.children[0].is('FilterNode') &&
            node.condition.children[0].name == 'notempty' &&
            node.condition.children[0].value.is('VariableNode') &&
            node.condition.children[0].value.fields.length === 1 &&
            node.condition.children[0].value.fields[0].startsWith('caller'))
        {
            return new NodeList(node.children);
        }

        return node;
    }
}

module.exports.JspPreferYieldTransformer = JspPreferYieldTransformer;
