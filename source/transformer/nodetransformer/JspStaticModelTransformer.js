'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeTransformer = require('../NodeTransformer.js').NodeTransformer;
const ViewModelRepository = require('../../model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const NodeList = require('../node/NodeList.js').NodeList;
const SetNode = require('../node/SetNode.js').SetNode;
const ExpressionNode = require('../node/ExpressionNode.js').ExpressionNode;
const DictionaryNode = require('../node/DictionaryNode.js').DictionaryNode;
const VariableNode = require('../node/VariableNode.js').VariableNode;
const synchronize = require('../../utils/synchronize.js');
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * Globals
 */
let uniqueId = 1;


/**
 *
 */
class JspStaticModelTransformer extends NodeTransformer
{
    /**
     * @ignore
     */
    constructor(viewModelRepository)
    {
        super();

        //Check params
        assertParameter(this, 'viewModelRepository', viewModelRepository, true, ViewModelRepository);

        // Assign options
        this._viewModelRepository = viewModelRepository;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [ViewModelRepository] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/nodetransformer/JspStaticModelTransformer';
    }


    /**
     * @inheritDoc
     * @todo  support for extended sites is missing
     */
    transformNode(node, options)
    {
        // prepend call nodes with jsonLaoder when model is a string literal
        if (node.type === 'CallNode' &&
            node.parameters.getParameter('model'))
        {
            const model = node.parameters.getParameter('model');
            if (model.value.children.length === 1 &&
                model.value.children[0].type === 'LiteralNode' &&
                model.value.children[0].valueType === 'string')
            {
                // Generate a static json set
                const modelName = 'staticModel' + (uniqueId++);
                const modelPath = model.value.children[0].value;
                const viewModel = synchronize.execute(this._viewModelRepository, 'getByPath', [modelPath]);
                const jsonNode = new DictionaryNode(viewModel.data);
                const setNode = new SetNode(new VariableNode([modelName]), new ExpressionNode([jsonNode]));

                // Set model parameter to generated variable
                model.value = new ExpressionNode([new VariableNode([modelName])])

                // Add
                const listNode = new NodeList([setNode, node]);
                return listNode;
            }
        }
        return node;
    }
}

module.exports.JspStaticModelTransformer = JspStaticModelTransformer;
