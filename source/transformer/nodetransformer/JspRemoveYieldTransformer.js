'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const JspDecorateVariablesTransformer = require('./JspDecorateVariablesTransformer.js').JspDecorateVariablesTransformer;
const NodeList = require('../node/NodeList.js').NodeList;
const SetNode = require('../node/SetNode.js').SetNode;
const VariableNode = require('../node/VariableNode.js').VariableNode;
const synchronize = require('../../utils/synchronize.js');


/**
 *
 */
class JspRemoveYieldTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspRemoveYieldTransformer';
    }


    /**
     * @inheritDoc
     * @todo Handle extended / override macros
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
            return new NodeList(node.elseChildren);
        }

        // Remove caller()
        if (node.is('YieldNode'))
        {
            return false;
        }
        return node;
    }
}

module.exports.JspRemoveYieldTransformer = JspRemoveYieldTransformer;
