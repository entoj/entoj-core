'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseValueObject = require('../BaseValueObject.js').BaseValueObject;
const EntityId = require('./EntityId.js').EntityId;
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * @namespace model.entity
 */
class Entity extends BaseValueObject
{
    /**
     * @param {entity.EntityId} id
     */
    constructor(id)
    {
        super();

        //Check params
        assertParameter(this, 'id', id, true, EntityId);

        // Add initial values
        this._id = id;
        this._usedBy = [];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntityId] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.entity/Entity';
    }


    /**
     * @property {*}
     */
    get uniqueId()
    {
        return this._id.pathString;
    }


    /**
     * @property {entity.EntityId}
     */
    get id()
    {
        return this._id;
    }

    set id(value)
    {
        this._id = value;
    }


    /**
     * @property {Array}
     */
    get usedBy()
    {
        return this._usedBy;
    }


    /**
     * @property {Bool}
     */
    get isGlobal()
    {
        return this._id ? this._id.isGlobal : false;
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className} ${this.id.category.longName}-${this.id.name}]`;
    }


    /**
     * @inheritDocs
     */
    update(data, clear)
    {
        const scope = this;
        const promise = super.update(data, clear).then(function()
        {
            scope.id = data.id || undefined;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Entity = Entity;
