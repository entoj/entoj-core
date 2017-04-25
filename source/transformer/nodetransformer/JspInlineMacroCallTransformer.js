'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const JspDecorateVariablesTransformer = require('./JspDecorateVariablesTransformer.js').JspDecorateVariablesTransformer;
const JspPreferYieldTransformer = require('./JspPreferYieldTransformer.js').JspPreferYieldTransformer;
const NodeList = require('../node/NodeList.js').NodeList;
const SetNode = require('../node/SetNode.js').SetNode;
const VariableNode = require('../node/VariableNode.js').VariableNode;
const synchronize = require('../../utils/synchronize.js');

/**
 * Unique Id
 */
let uniqueId = 1;


/**
 * Reset the unique id (use this only for testing purposes)
 */
function resetUniqueId()
{
    uniqueId = 1;
}


/**
 *
 */
class JspInlineMacroCallTransformer extends NodeTransformer
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspInlineMacroCallTransformer';
    }


    /**
     * @inheritDoc
     * @todo Handle extended / override macros
     */
    transformNode(node, transformer, options)
    {
        // inline call nodes
        if (node.type === 'CallNode')
        {
            // See if call needs to be inlined
            const macroSettings = synchronize.execute(transformer, 'getMacroSettings', [undefined, node.name]);
            if (macroSettings.getByPath('mode', false) === 'inline' ||
                (node.children && node.children.length))
            {
                // Prepare
                const suffix = '_u' + (uniqueId++);
                const rootNode = new NodeList();

                // Get called macro
                const rawMacroNode = synchronize.execute(transformer, 'parseMacro', [undefined, node.name]);
                const macroNode = synchronize.execute(transformer, 'transformNode', [rawMacroNode]);

                // Add parameters as set's
                for (const parameter of macroNode.parameters.children)
                {
                    const variableNode = new VariableNode([parameter.name + suffix]);
                    const callParameter = node.parameters.getParameter(parameter.name);
                    const setNode = new SetNode(variableNode, callParameter ? callParameter.value : parameter.value);
                    rootNode.children.push(setNode);
                }

                // Make variables unique
                const variablesTransformer = new JspDecorateVariablesTransformer();
                let preparedMacro = synchronize.execute(variablesTransformer, 'transform', [macroNode, transformer, { suffix: suffix }]);

                // Add children to yield?
                if (node.children && node.children.length)
                {
                    const yieldNode = preparedMacro.find('YieldNode');
                    if (yieldNode)
                    {
                        const yieldNodes = new NodeList();
                        yieldNodes.children.load(node.children);
                        preparedMacro.replace(yieldNode, yieldNodes);

                        const preferYieldTransformer = new JspPreferYieldTransformer();
                        preparedMacro = synchronize.execute(preferYieldTransformer, 'transform', [preparedMacro, transformer]);
                    }
                }

                // Add macro body to list
                rootNode.children.load(preparedMacro.children);

                return rootNode;
            }
        }
        return node;
    }
}

module.exports.JspInlineMacroCallTransformer = JspInlineMacroCallTransformer;
module.exports.resetUniqueId = resetUniqueId;
