'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const BaseMap = require('../base/BaseMap.js').BaseMap;
const assertParameter = require('../utils/assert.js').assertParameter;


/**
 * Source code transformer
 */
class Transformer extends Base
{
    /**
     * @ignore
     */
    constructor(parser, renderer, nodeTransformers)
    {
        super();

        //Check params
        assertParameter(this, 'parser', parser, true, BaseParser);
        assertParameter(this, 'renderer', renderer, true, BaseRenderer);

        // Assign options
        this._parser = parser;
        this._renderer = renderer;
        this._nodeTransformers = nodeTransformers || [];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [BaseParser, BaseRenderer, 'transformer/Transformer.transformers'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/Transformer';
    }


    /**
     *
     */
    transform(source, options)
    {
        let rootNode = this._parser.parse(source);
        for (const nodeTransformer of this._nodeTransformers)
        {
            rootNode = nodeTransformer.transform(node, this, options);
        }
        const result = this._renderer.render(rootNode, options);
        return result;
    }
}
