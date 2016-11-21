'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;


/**
 * Adds configurable prefix and suffix to VariableNodes. To specify only a
 * subset of all variables use a filter function.
 */
class JspDecorateVariablesTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspDecorateVariablesTransformer';
    }


    /**
     * @inheritDoc
     */
    transformNode(node, transformer, options)
    {
        if (node.type == 'VariableNode' && options)
        {
            // See if variable is allowed
            if (!options.filter || (options.filter && options.filter(node.fields[0])))
            {
                // Add pre/suffix
                node.fields[0] = (options.prefix || '') + node.fields[0] + (options.suffix || '');
            }
        }
        return node;
    }
}

module.exports.JspDecorateVariablesTransformer = JspDecorateVariablesTransformer;
