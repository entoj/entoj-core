'use strict';

/**
 * Requirements
 * @ignore
 */
const deasync = require('deasync');


/**
 * @memberOf utils
 * @param {object} scope
 * @param {string} method
 * @param {array} parameters
 * @returns {*}
 */
function execute(scope, method, parameters)
{
    let result = false;
    let done = false;
    let promise;
    if (scope)
    {
        promise = scope[method].apply(scope, parameters);
    }
    else
    {
        promise = method.apply(scope, parameters);
    }
    promise.then(function(data)
    {
        result = data;
        done = true;
    });
    deasync.loopWhile(() => !done);
    return result;
}


/**
 * Traps all method calls and sychronizes promise resolving
 *
 * @memberOf utils
 * @param  {*} target
 * @return {*}
 */
function synchronize(target)
{
    const proxy = Proxy.create(
        {
            get: function(receiver, name)
            {
                if (typeof target[name] === 'function')
                {
                    return function()
                    {
                        const raw = target[name].apply(target, arguments);
                        if (raw instanceof Promise)
                        {
                            let done = false;
                            let result;
                            raw.then(function(data)
                            {
                                result = data;
                                done = true;
                            });
                            deasync.loopWhile(() => !done);
                            return result;
                        }
                        else
                        {
                            return raw;
                        }
                    };
                }
                else
                {
                    return target[name];
                }
            },

            set: function(receiver, name, value)
            {
                target[name] = value;
                return true;
            }
        });
    return proxy;
}



/**
 * Exports
 * @ignore
 */
module.exports.execute = execute;
module.exports.synchronize = synchronize;
