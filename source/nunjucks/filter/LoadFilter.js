'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const assertParameter = require('../../utils/assert.js').assertParameter;
const synchronize = require('../../utils/synchronize.js');
const uppercaseFirst = require('../../utils/string.js').uppercaseFirst;
const isObject = require('lodash.isobject');
const isString = require('lodash.isstring');
const path = require('path');
const fs = require('fs');
const lorem = require('lorem-ipsum');



/**
 * @memberOf nunjucks.filter
 */
class LoadFilter extends BaseFilter
{
    /**
     * @param {nunjucks.Environment} environment
     * @param {EntitiesRepository} entitiesRepository
     * @param {PathesConfiguration} pathesConfiguration
     * @param {Object} options
     */
    constructor(entitiesRepository, pathesConfiguration, options)
    {
        super();
        this._name = 'load';

        // Check params
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._options = options || {};
        this._entitiesRepository = entitiesRepository;
        this._pathesConfiguration = pathesConfiguration;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, PathesConfiguration, 'nunjucks.filter/LoadFilter.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/LoadFilter';
    }


    /**
     * @param {*} value
     */
    finalize(context, data)
    {
        const keys = Object.keys(data);
        for (const key of keys)
        {
            if (isObject(data[key]))
            {
                this.finalize(context, data[key]);
            }
            else
            {
                // @import
                if (isString(data[key]) && data[key].startsWith('@import'))
                {
                    // Get opts
                    const optionsParts = data[key].split(':');
                    const filename = (optionsParts.length == 1) ? '' : optionsParts[1];
                    data[key] = this.load(context, filename);
                }

                // @lipsum
                if (isString(data[key]) && data[key].startsWith('@lipsum'))
                {
                    if (this._environment.isStatic)
                    {
                        data[key] = 'Lorem ipsum dolorem sit';
                    }
                    else
                    {
                        // Get opts
                        const optionsParts = data[key].split(':');
                        const options = (optionsParts.length == 1) ? [] : optionsParts[1].split(',');
                        let units = 'words';
                        let min = 1;
                        let max = 10;
                        if (options.length > 0)
                        {
                            if (options[0] == 'w' || options[0] == 's' || options[0] == 'p')
                            {
                                const unitsShort = options.shift();
                                if (unitsShort == 's')
                                {
                                    units = 'sentences';
                                }
                                if (unitsShort == 'p')
                                {
                                    units = 'paragraphs';
                                }
                            }
                            if (options.length == 1)
                            {
                                max = parseInt(options[0], 10);
                            }
                            else if (options.length == 2)
                            {
                                min = parseInt(options[0], 10);
                                max = parseInt(options[1], 10);
                            }
                        }
                        const count = min + ((max - min) * Math.random());

                        data[key] = uppercaseFirst(lorem(
                            {
                                count: count,
                                units: units
                            }));
                    }
                }
            }
        }
    }


    /**
     * @param {*} scope
     * @param {*} value
     */
    trySite(modelName, entityId, site)
    {
        // Get entity
        const entity = synchronize.execute(this._entitiesRepository, 'getById', [entityId, site]);
        if (!entity)
        {
            return false;
        }

        // Fetch entity json
        let json = '/models/' + modelName;
        if (!json.endsWith('.json'))
        {
            json+= '.json';
        }
        const filename = synchronize.execute(this._pathesConfiguration, 'resolveEntity', [entity, json]);
        if (!fs.existsSync(filename))
        {
            return false;
        }

        return filename;
    }


    /**
     * @param {*} scope
     * @param {*} value
     */
    load(context, value)
    {
        if (isString(value))
        {
            // Check straight path
            let filename = path.resolve((this._options.path || '') + value);
            if (!fs.existsSync(filename))
            {
                // Check missing .json
                filename+= '.json';
                if (!fs.existsSync(filename))
                {
                    // Prepare
                    const parts = value.split('/');
                    filename = false;

                    // Check if context contains the current site
                    if (context && context.ctx && context.ctx.site)
                    {
                        let site = context.ctx.site;
                        while(site && !filename)
                        {
                            filename = this.trySite(parts[1], parts[0], site);
                            if (!filename)
                            {
                                site = site.extends;
                            }
                        }
                    }
                    else
                    {
                        filename = this.trySite(parts[1], parts[0]);
                    }
                }
            }

            // Get data
            let data = {};
            if (filename)
            {
                data = JSON.parse(fs.readFileSync(filename, { encoding: 'utf8' }));
                if (data)
                {
                    this.finalize(context, data);
                }
            }

            return data;
        }
        return value;
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        const scope = this;
        return function (value)
        {
            return scope.load(this, value);
        };
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.LoadFilter = LoadFilter;
