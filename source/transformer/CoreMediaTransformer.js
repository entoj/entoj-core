'use strict';

/**
 * Requirements
 * @ignore
 */
const Transformer = require('./Transformer.js').Transformer;
const Parser = require('./Parser.js').Parser;
const CoreMediaRenderer = require('./CoreMediaRenderer.js').CoreMediaRenderer;
const JspConcatTransformer = require('./nodetransformer/JspConcatTransformer.js').JspConcatTransformer;
const JspEmptyTransformer = require('./nodetransformer/JspEmptyTransformer.js').JspEmptyTransformer;
const JspSelfTransformer = require('./nodetransformer/JspSelfTransformer.js').JspSelfTransformer;
const JspStaticModelTransformer = require('./nodetransformer/JspStaticModelTransformer.js').JspStaticModelTransformer;
const JspInlineMacroCallTransformer = require('./nodetransformer/JspInlineMacroCallTransformer.js').JspInlineMacroCallTransformer;
const JspRemoveMacroCallTransformer = require('./nodetransformer/JspRemoveMacroCallTransformer.js').JspRemoveMacroCallTransformer;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const ViewModelRepository = require('../model/viewmodel/ViewModelRepository.js').ViewModelRepository;


/**
 * CoreMedia code transformer
 */
class CoreMediaTransformer extends Transformer
{
    /**
     * @ignore
     */
    constructor(globalRepository, viewModelRepository)
    {
        super(globalRepository,
            new Parser(),
            new CoreMediaRenderer(),
            [
                new JspConcatTransformer(),
                new JspEmptyTransformer(),
                new JspSelfTransformer(),
                new JspStaticModelTransformer(viewModelRepository),
                new JspInlineMacroCallTransformer(),
                new JspRemoveMacroCallTransformer()
            ]);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [GlobalRepository, ViewModelRepository] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/CoreMediaTransformer';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaTransformer = CoreMediaTransformer;
