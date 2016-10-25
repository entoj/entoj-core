"use strict";

/**
 * Requirements
 */
const BaseTask = require(SOURCE_ROOT + '/task/BaseTask.js').BaseTask;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseTaskSpec = require(TEST_ROOT + '/task/BaseTaskShared.js');


/**
 * Spec
 */
describe(BaseTask.className, function()
{
    baseTaskSpec(BaseTask, 'task/BaseTask', function(parameters)
    {
        parameters.unshift(new CliLogger('', { muted: true }));
        return parameters;
    });
});
