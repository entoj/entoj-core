'use strict';

/**
 * Requirements
 * @ignore
 */
const NodeList = require('./NodeList.js').NodeList;
const ParameterNode = require('./ParameterNode.js').ParameterNode;


/**
 *
 */
class ParametersNode extends NodeList
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer.node/ParametersNode';
    }


    /**
     * @param {String} name
     * @returns {ParameterNode|Boolean}
     */
    getParameter(name)
    {
        return this.children.find((parameter) => parameter.name === name);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ParametersNode = ParametersNode;
