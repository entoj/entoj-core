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
    constructor(keyName, valueName, value, children)
    {
        super(children);
        this.serializeFields.push('keyName', 'valueName', 'value');
        this.nodeFields.push('value');
        this.keyName = keyName;
        this.valueName = valueName;
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
