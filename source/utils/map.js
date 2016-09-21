'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseMap = require('../base/BaseMap.js').BaseMap;

/**
 * @memberof utils
 */
function create()
{
    const map = new BaseMap();
    const proxy = Proxy.create(
        {
            get: function(receiver, name)
            {
                if (typeof map[name] === 'function')
                {
                    return map[name].bind(map);
                }
                if (typeof map[name] !== 'undefined')
                {
                    return map[name];
                }
                return map.get(name);
            },


            set: function(receiver, name, value)
            {
                if (map.hasOwnProperty(name))
                {
                    map[name] = value;
                }
                else if (typeof map[name] === 'function')
                {
                    return true;
                }
                else
                {
                    map.set(name, value);
                }
                return true;
            },


            has: function(receiver, name)
            {
                return name in map || map.has(name);
            },


            hasOwn: function(receiver, name)
            {
                return map.hasOwnProperty(name) || map.has(name);
            },


            keys: function(receiver, name)
            {
                const keys = Object.keys(map);
                map.forEach(function(value, key)
                {
                    keys.push(key);
                });
                return keys;
            },


            ownKeys: function(receiver, name)
            {
                const keys = Object.keys(map);
                map.forEach(function(value, key)
                {
                    keys.push(key);
                });
                return keys;
            },


            getOwnPropertyDescriptor: function(receiver, name)
            {
                if (!map.has(name))
                {
                    return undefined;
                }
                const descriptor =
                {
                    'value': map.get(name),
                    'writable': true,
                    'enumerable': true,
                    'configurable': true
                };
                return descriptor;
            },


            getOwnPropertyNames: function()
            {
                const keys = Object.keys(map);
                map.forEach(function(value, key)
                {
                    keys.push(key);
                });
                return keys;
            },


            getPropertyNames: function()
            {
                const keys = Object.keys(map);
                map.forEach(function(value, key)
                {
                    keys.push(key);
                });
                return keys;
            },


            enumerate: function()
            {
                const keys = Object.keys(map);
                map.forEach(function(value, key)
                {
                    keys.push(key);
                });
                return keys;
            }
        });
    return proxy;
}


/**
 * Exports
 * @ignore
 */
module.exports.create = create;
