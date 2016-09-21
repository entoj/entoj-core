'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const BaseMap = require('../../base/BaseMap.js').BaseMap;


/**
 * Holds all build related configuration.
 *
 * @memberOf model.configuration
 */
class BuildConfiguration extends Base
{
    /**
     * @param {object} options
     */
    constructor(options, environment)
    {
        super();

        const opts = options || {};
        this._environment = environment || opts.default || 'development';
        this._values = new BaseMap();
        opts.environments = opts.environments || {};
        for (const environment of Object.keys(opts.environments))
        {
            this._values.set(environment, opts.environments[environment]);
        }
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': ['model.configuration/BuildConfiguration.options', 'model.configuration/BuildConfiguration.environment'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.configuration/BuildConfiguration';
    }


    /**
     * @inheritDoc
     */
    get environment()
    {
        return this._environment;
    }


    /**
     * @inheritDoc
     */
    set environment(value)
    {
        this._environment = value;
    }


    /**
     * @inheritDoc
     */
    get(name, defaultValue)
    {
        const path = this._environment + '.' + name;
        return this._values.getByPath(path, defaultValue);
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className} ${this.root}`;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.BuildConfiguration = BuildConfiguration;
