'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;


/**
 *
 */
class CallNode extends NodeList
{
    /**
     * @ignore
     */
    constructor(name, parameters, children)
    {
        super(children);
        this.serializeFields.push('name', 'parameters');
        this.nodeFields.push('parameters');
        this.name = name;
        this.parameters = parameters || [];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/CallNode';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CallNode = CallNode;
