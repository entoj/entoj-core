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
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const co = require('co');


/**
 * CoreMedia code transformer
 */
class CoreMediaTransformer extends Transformer
{
    /**
     * @ignore
     */
    constructor(globalRepository)
    {
        super(globalRepository,
            new Parser(),
            new CoreMediaRenderer(),
            [new JspConcatTransformer(), new JspEmptyTransformer()]);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [GlobalRepository] };
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
