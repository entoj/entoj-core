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
class JspRemoveMacroCallTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspRemoveMacroCallTransformer';
    }


    /**
     * @inheritDoc
     * @todo Handle extended / override macros
     */
    transformNode(node, transformer, options)
    {
        // remove call nodes
        if (node.type === 'CallNode')
        {
            // See if call needs to be removed
            const macroSettings = synchronize.execute(transformer, 'getMacroSettings', [undefined, node.name]);
            if (macroSettings.getByPath('mode', false) === 'remove')
            {
                return false;
            }
        }
        return node;
    }
}

module.exports.JspRemoveMacroCallTransformer = JspRemoveMacroCallTransformer;
