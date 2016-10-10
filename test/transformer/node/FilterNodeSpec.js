"use strict";

/**
 * Requirements
 */
const FilterNode = require(SOURCE_ROOT + '/transformer/node/FilterNode.js').FilterNode;
const BaseNode = require(SOURCE_ROOT + '/transformer/node/BaseNode.js').BaseNode;
const baseNodeSpec = require(TEST_ROOT + '/transformer/node/BaseNodeShared.js');


/**
 * Spec
 */
describe(FilterNode.className, function()
{
    /**
     * BaseNode Test
     */
    baseNodeSpec(FilterNode, 'transformer.node/FilterNode',
    {
        serialized:
        {
            type: FilterNode.className,
            name: 'filter',
            parameters:
            {
                type: 'transformer.node/BaseNode'
            },
            value:
            {
                type: 'transformer.node/BaseNode'
            }
        }
    }, prepareParameters);


    function prepareParameters(parameters)
    {
        parameters.push('filter');
        parameters.push(new BaseNode());
        parameters.push(new BaseNode());
        return parameters;
    }
});
