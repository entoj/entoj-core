'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;


/**
 * @class
 * @memberOf utils
 * @extends {Base}
 */
class DIContainer extends Base
{
    /**
     * @ignore
     */
    constructor()
    {
        super();
        this._mappings = new Map();
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'utils/DIContainer';
    }


    /**
     * @let {Map}
     */
    get mappings()
    {
        return this._mappings;
    }


    /**
     * @protected
     * @param {string|Class} type
     * @param {*} the value used for type when creating objects
     * @param {bool} isSingleton
     * @returns {void}
     */
    prepareMapping(type, value, isSingleton)
    {
        if (!type)
        {
            throw new TypeError('Tried to map falsy type');
        }
        if (!value)
        {
            throw new TypeError('Tried to map falsy value for ' + ((typeof type === 'string') ? type : type.className));
        }

        const mapping =
        {
            isSingleton: false,
            type: undefined,
            value: undefined
        };

        // name to value
        if (typeof type === 'string')
        {
            mapping.value = value;
        }
        // type to type
        else if (typeof value === 'function')
        {
            mapping.type = value;
            mapping.isSingleton = isSingleton || false;
        }
        // type to value
        else
        {
            mapping.value = value;
            mapping.isSingleton = true;
        }

        return mapping;
    }


    /**
     * @param {string|Class} type
     * @param {Map} mappings
     * @returns {*}
     */
    create(type, mappings)
    {
        // Guard
        if (type == undefined)
        {
            //console.log('Tried to create type undefined');
            return undefined;
        }

        // Get own mapping
        let ownMapping;
        if (this.mappings.has(type))
        {
            ownMapping = this.mappings.get(type);
            if (ownMapping.isSingleton && ownMapping.value)
            {
                //console.log('Using singleton for', type);
                return ownMapping.value;
            }
        }
        else
        {
            ownMapping =
            {
                isSingleton: false,
                type: type,
                value: type
            };
        }

        // Check if type is a name
        if (typeof type == 'string')
        {
            //console.log('Using named dependency for', type);
            return ownMapping.value;
        }

        // Create parameters
        const injections = ownMapping.type.injections || {};
        const parameters = [];

        if (injections.parameters && Array.isArray(injections.parameters))
        {
            for (const parameter of injections.parameters)
            {
                // get mapping infos
                let mapping = this.mappings.has(parameter) ? this.mappings.get(parameter) : undefined;

                // override?
                if (mappings && mappings.has(parameter))
                {
                    mapping = this.prepareMapping(parameter, mappings.get(parameter));
                }

                // handle missing mapping
                if (!mapping)
                {
                    mapping =
                    {
                        isSingleton: false,
                        type: (typeof parameter === 'function') ? parameter : undefined,
                        value: undefined
                    };
                }

                // check for named value
                if (typeof parameter === 'string')
                {
                    parameters.push(mapping.value);
                }
                else
                {
                    // mapping available?
                    if (mapping)
                    {
                        // handle singleton creation
                        if (mapping.isSingleton)
                        {
                            if (!mapping.value)
                            {
                                mapping.value = this.create(mapping.type);
                            }
                            parameters.push(mapping.value);
                        }
                        // just create a instance of the mapped type
                        else
                        {
                            parameters.push(this.create(mapping.type));
                        }
                    }
                    // create a unmapped type
                    else
                    {
                        parameters.push(this.create(parameter));
                    }
                }
            }
        }

        // create instance
        const instance = new ownMapping.type(...parameters);
        if (!instance)
        {
            throw new Error('Could not create instance for ' + type.className);
        }

        // update own mapping
        if (ownMapping.isSingleton)
        {
            ownMapping.value = instance;
        }

        return instance;
    }


    /**
     * @param {string|Class} type
     * @param {*} the value used for type when creating objects
     * @param {bool} isSingleton
     * @returns {void}
     */
    map(type, value, isSingleton)
    {
        const mapping = this.prepareMapping(type, value, isSingleton);
        this.mappings.set(type, mapping);
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.DIContainer = DIContainer;
module.exports.container = new DIContainer();
