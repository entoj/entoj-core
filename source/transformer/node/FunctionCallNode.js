'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseNode = require('./BaseNode.js').BaseNode;


/**
 *
 */
class FunctionCallNode extends BaseNode
{
    /**
     * @ignore
     */
    constructor(variable, name, parameters)
    {
        super();
        this.serializeFields.push('variable', 'name', 'parameters');
        this.nodeFields.push('variable', 'parameters');
        this.variable = variable;
        this.name = name;
        this.parameters = parameters || [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/FunctionCallNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.FunctionCallNode = FunctionCallNode;
