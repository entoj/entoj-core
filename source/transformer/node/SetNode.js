'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class SetNode extends BaseNode
{
    /**
     * @ignore
     */
    constructor(variable, value, children)
    {
        super(children);
        this.serializeFields.push('variable', 'value');
        this.nodeFields.push('variable', 'value');
        this.variable = variable;
        this.value = value;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/SetNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.SetNode = SetNode;
