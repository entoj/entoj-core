'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;


/**
 *
 */
class JspSelfTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspSelfTransformer';
    }


    /**
     * @inheritDoc
     */
    transformNode(node, transformer, options)
    {
        // remove any set's to model/self references
        if (node.type == 'SetNode' &&
            node.variable.fields.length == 1 &&
            ((node.variable.fields[0] == 'self') || (node.variable.fields[0] == 'model') || node.variable.fields[0].startsWith('model_')))
        {
            return false;
        }

        // change model to self
        if (node.type == 'VariableNode' &&
            node.fields.length > 0 &&
            (node.fields[0] == 'model' || node.fields[0].startsWith('model_')))
        {
            node.fields[0] = 'self';
        }

        return node;
    }
}

module.exports.JspSelfTransformer = JspSelfTransformer;
