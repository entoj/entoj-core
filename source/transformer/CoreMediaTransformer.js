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
const resetUniqueId = require('./nodetransformer/JspInlineMacroCallTransformer.js').resetUniqueId;
const JspRemoveMacroCallTransformer = require('./nodetransformer/JspRemoveMacroCallTransformer.js').JspRemoveMacroCallTransformer;
const JspForEachTransformer = require('./nodetransformer/JspForEachTransformer.js').JspForEachTransformer;
const JspRemoveYieldTransformer = require('./nodetransformer/JspRemoveYieldTransformer.js').JspRemoveYieldTransformer;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const ViewModelRepository = require('../model/viewmodel/ViewModelRepository.js').ViewModelRepository;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;


/**
 * CoreMedia code transformer
 */
class CoreMediaTransformer extends Transformer
{
    /**
     * @ignore
     */
    constructor(globalRepository, viewModelRepository, globalConfiguration, pathesConfiguration)
    {
        super(globalRepository,
            new Parser(),
            new CoreMediaRenderer(globalRepository, globalConfiguration, pathesConfiguration),
            [
                new JspConcatTransformer(),
                new JspEmptyTransformer(),
                new JspSelfTransformer(),
                new JspStaticModelTransformer(viewModelRepository),
                new JspInlineMacroCallTransformer(),
                new JspRemoveMacroCallTransformer(),
                new JspForEachTransformer()
            ],
            [new JspRemoveYieldTransformer()]);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [GlobalRepository, ViewModelRepository, GlobalConfiguration, PathesConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/CoreMediaTransformer';
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    transformTemplate(siteQuery, entity, parameters)
    {
        resetUniqueId();
        return super.transformTemplate(siteQuery, entity, parameters);
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    transformMacro(siteQuery, macroQuery, parameters)
    {
        resetUniqueId();
        return super.transformMacro(siteQuery, macroQuery, parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CoreMediaTransformer = CoreMediaTransformer;
