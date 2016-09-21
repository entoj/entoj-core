/* eslint no-console:0 */
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
class StopWatch extends Base
{
    /**
     * @ignore
     */
    constructor()
    {
        super();
        this._watches = {};
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'utils/StopWatch';
    }


    /**
     */
    start(name, label)
    {
        this._watches[name] = { label: label, started: Date.now() };
    }

    /**
     */
    stop(name)
    {
        if (!this._watches[name])
        {
            return;
        }
        const label = this._watches[name].label || '';
        const time = Date.now() - this._watches[name].started;
        console.log('StopWatch ' + name + ' - ' + label + ' => ' + time);
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.StopWatch = StopWatch;
