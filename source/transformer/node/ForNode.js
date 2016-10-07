'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;


/**
 *
 */
class ForNode extends NodeList
{
    /**
     * @ignore
     */
    constructor(name, value, children)
    {
        super(children);
        this.serializeFields.push('name', 'value');
        this.nodeFields.push('value');
        this.name = name;
        this.value = value || [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/ForNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ForNode = ForNode;
