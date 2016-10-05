'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const stopWatch = require('../utils/StopWatch.js').stopWatch;
const signals = require('signals');
const co = require('co');


/**
 * @class
 * @memberOf entity
 * @extends {Base}
 */
class BaseRepository extends Base
{
    /**
     * @ignore
     */
    constructor(loader)
    {
        super();

        // Assign
        this._items = [];
        this._loader = loader;
        this._isLoaded = false;
        this._signals = {};

        // Add signals
        this.signals.added = new signals.Signal();
        this.signals.removed = new signals.Signal();
        this.signals.replaced = new signals.Signal();
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model/BaseRepository';
    }


    /**
     * @property {*}
     */
    get signals()
    {
        return this._signals;
    }


    /**
     * @property {BaseLoader}
     */
    get loader()
    {
        return this._loader;
    }


    /**
     * @protected
     * @returns {Promise.<Array>}
     */
    invalidateFind(query)
    {
        const queryId = (typeof query.uniqueId !== 'undefined') ? query.uniqueId : query;
        return Promise.resolve(this._items.filter(function(item)
        {
            const itemId = (typeof item.uniqueId !== 'undefined') ? item.uniqueId : item;
            return (itemId === queryId);
        }));
    }


    /**
     * @protected
     * @returns {Promise.<Array>}
     */
    invalidateBefore(result, action, item)
    {
        result[action] = result[action] || [];
        result[action].push(item);
        return Promise.resolve();
    }


    /**
     * @protected
     * @returns {Promise.<Array>}
     */
    invalidateAfter(result, action, item)
    {
        result[action] = result[action] || [];
        return Promise.resolve();
    }


    /**
     * @protected
     * @returns {Promise}
     */
    loadAfter(items)
    {
        return Promise.resolve();
    }


    /**
     * @returns {Promise.<array>}
     */
    getItems()
    {
        stopWatch.start(this.className + '.getItems');
        if (this._isLoaded || !this._loader)
        {
            stopWatch.stop(this.className + '.getItems');
            return Promise.resolve(this._items);
        }
        const scope = this;
        const promise = co(function* ()
        {
            stopWatch.start(scope.className + '.getItems:load');
            const data = yield scope._loader.load();
            const loadedItems = Array.isArray(data) ? data : [];
            scope._items = loadedItems;
            scope._isLoaded = true;
            yield scope.loadAfter(scope._items);
            yield scope.updatedItems();
            stopWatch.stop(scope.className + '.getItems:load');
            stopWatch.stop(scope.className + '.getItems');
            return scope._items;
        });
        return promise;
    }

    /**
     * Called whenever any item has changed.
     * This is done automatically when invalidating the repository.
     * When you change things manually you should call this method aftwerwards.
     *
     * @returns {Promise}
     */
    updatedItems()
    {
        return Promise.resolve(true);
    }


    /**
     * Reload all or specific items from the underlying loader
     *
     * @param {Object} changes
     * @returns {Promise}
     */
    invalidate(changes)
    {
        const scope = this;
        const promise = co(function* ()
        {
            const result = {};

            // Check if we only need to load all items
            if (!changes || !scope._isLoaded || !scope._items)
            {
                if (scope._loader)
                {
                    scope._items = yield scope._loader.load();
                    scope._isLoaded = true;
                    for (const loadedItem of scope._items)
                    {
                        yield scope.invalidateBefore(result, 'add', loadedItem);
                        yield scope.invalidateAfter(result, 'add', loadedItem);
                    }
                }
            }
            // Synchronize specific items
            else
            {
                let items = [];
                let existingItems;
                let existingItem;

                // Load updates
                if (changes.add)
                {
                    items = yield scope._loader.load(changes.add);
                }

                // Apply updates
                for (const item of items)
                {
                    existingItems = yield scope.invalidateFind(item);

                    // Update
                    if (existingItems.length > 0)
                    {
                        for (existingItem of existingItems)
                        {
                            yield scope.invalidateBefore(result, 'update', existingItem);
                            yield existingItem.update(item, true);
                            yield scope.invalidateAfter(result, 'update', existingItem);
                        }
                    }
                    // Add
                    else
                    {
                        yield scope.invalidateBefore(result, 'add', item);
                        scope._items.push(item);
                        yield scope.invalidateAfter(result, 'add', item);
                    }
                }

                // Remove items
                if (changes.remove)
                {
                    for (const removeId of changes.remove)
                    {
                        existingItems = yield scope.invalidateFind(removeId);
                        for (existingItem of existingItems)
                        {
                            /*
                            const index = scope._items.indexOf(existingItem);
                            console.log('Trying to removeId=', removeId, ', item=', existingItem.toString(), ', index=', index);
                            if (index > -1)
                            {
                                yield scope.invalidateBefore(result, 'remove', existingItem);
                                scope._items.splice(index, 1);
                                yield scope.invalidateAfter(result, 'remove', existingItem);
                            }
                            */
                            yield scope.invalidateBefore(result, 'remove', existingItem);
                            scope.remove(existingItem);
                            yield scope.invalidateAfter(result, 'remove', existingItem);
                        }
                    }
                }
            }

            yield scope.updatedItems();

            return result;
        })
        .catch(function(e)
        {
            throw new Error(e);
        });
        return promise;
    }


    /**
     * Adds all given items.
     *
     * @returns {Promise.<Boolean>}
     */
    add()
    {
        const scope = this;
        const items = Array.from(arguments);
        const promise = this.getItems().then(function(data)
        {
            Array.prototype.push.apply(data, items);
            scope.signals.added.dispatch(scope, items);
            return scope.updatedItems();
        });
        return promise;
    }


    /**
     * Removes items by their uniqueId's or the actual value's.
     *
     * @returns {Promise.<Boolean>}
     */
    remove()
    {
        const scope = this;
        const items = Array.from(arguments);
        const promise = this.getItems().then(function(data)
        {
            const removeItems = [];
            for (const item of items)
            {
                // Get uniqueId
                const uniqueId = (typeof item.uniqueId !== 'undefined') ? item.uniqueId : item;

                // Find items
                for (const dataItem of data)
                {
                    const dataItemUniqueId = (typeof dataItem.uniqueId !== 'undefined') ? dataItem.uniqueId : dataItem;
                    if (uniqueId === dataItemUniqueId)
                    {
                        removeItems.push(dataItem);
                    }
                }
            }

            // Remove em
            for (const removeItem of removeItems)
            {
                const index = data.indexOf(removeItem);
                if (index > -1)
                {
                    data.splice(index, 1);
                }
            }

            scope.signals.removed.dispatch(scope, removeItems);
            return scope.updatedItems();
        });
        return promise;
    }


    /**
     * Replace items by their uniqueId's or the actual value's.
     *
     * @returns {Promise.<Boolean>}
     */
    replace()
    {
        const scope = this;
        const items = Array.from(arguments);
        const promise = co(function* ()
        {
            yield scope.remove.apply(scope, items);
            yield scope.add.apply(scope, items);
            scope.signals.replaced.dispatch(scope, items);
            return true;
        });
        return promise;
    }


    /**
     * Get a list of a specific property of all items.
     *
     * @param {string} property
     * @returns {Promise.<array>}
     */
    getPropertyList(property)
    {
        const promise = this.getItems().then(function(data)
        {
            return Promise.resolve(data.map(item => item[property]));
        });
        return promise;
    }


    /**
     * Get the first item.
     *
     * @returns {Promise.<*>}
     */
    getFirst()
    {
        const promise = this.getItems().then(function(data)
        {
            return Promise.resolve(data[0] || false);
        });
        return promise;
    }


    /**
     * Find a item by property(s) value.
     *
     * @param {string|array} property the property name, can be an array of property names
     * @param {mixed} value the property value
     * @param {function} [compare] function that returns true if both values provided are equal
     * @returns {Promise.<*>}
     */
    findBy(property, value, compare)
    {
        const properties = Array.isArray(property) ? property : [property];
        const searchValue = (typeof value == 'string') ? value.toLowerCase() : value;
        const promise = this.getItems().then(function(data)
        {
            const result = data.find(function(item)
            {
                for(const p of properties)
                {
                    const itemValue = (typeof item[p] == 'string') ? item[p].toLowerCase() : item[p];
                    let isMatch = itemValue === searchValue;
                    if (compare)
                    {
                        isMatch = compare(itemValue, searchValue);
                    }
                    if (isMatch)
                    {
                        return true;
                    }
                }
                return false;
            });
            return Promise.resolve(result);
        });

        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.BaseRepository = BaseRepository;
