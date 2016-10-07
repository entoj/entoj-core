'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class TextNode extends BaseNode
{
    /**
     * @ignore
     */
    constructor(value)
    {
        super();
        this.serializeFields.push('value');
        this.value = value;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/TextNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TextNode = TextNode;
