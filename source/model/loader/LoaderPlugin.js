'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const co = require('co');


/**
 * Base class for repository loader plugins.
 *
 * Plugins are executed by the loader for each value object.
 */
class LoaderPlugin extends Base
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader/LoaderPlugin';
    }


    /**
     * @param {BaseValueObject} item
     * @param {Site} [site]
     */
    executeFor(item, site)
    {
        return Promise.resolve(true);
    }


    /**
     * @param {BaseValueObject} item
     */
    execute(item)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Load base version
            yield scope.executeFor(item);

            // Load extended versions
            if (item.usedBy)
            {
                for (const extended of item.usedBy)
                {
                    yield scope.executeFor(item, extended);
                }
            }

            return true;
        })
        .catch(function(e)
        {
            throw new Error('Failed executing plugin : ' + e.message);
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.LoaderPlugin = LoaderPlugin;
