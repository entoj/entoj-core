/* eslint no-console:0 */
'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const chalk = require('chalk');


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
    start(name)
    {
        if (!this._watches[name])
        {
            this._watches[name] =
            {
                name: name,
                count: 0,
                time: 0,
                min: Number.MAX_SAFE_INTEGER,
                max: 0
            };
        }
        this._watches[name].started = Date.now();
    }


    /**
     */
    stop(name)
    {
        if (!this._watches[name])
        {
            return;
        }
        this._watches[name].count++;
        const time = Date.now() - this._watches[name].started;
        this._watches[name].time+= time;
        this._watches[name].min = Math.min(this._watches[name].min, time);
        this._watches[name].max = Math.max(this._watches[name].max, time);
        this._watches[name].average = this._watches[name].time / this._watches[name].count;
        delete this._watches[name].started;
    }


    /**
     */
    show()
    {
        console.log(chalk.bold('\nTimers:\n'));
        for (const name in this._watches)
        {
            const timer = this._watches[name];
            console.log(chalk.yellow(' ' + timer.name));
            console.log('  count: ' + timer.count + ', total: ' + timer.time + ', average: ' + timer.average.toFixed(2));
            console.log();
        }
    }


    /**
     */
    clear()
    {
        this._watches = {};
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.StopWatch = StopWatch;
module.exports.stopWatch = new StopWatch();
