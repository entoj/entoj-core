'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseTask = require('./BaseTask.js').BaseTask;
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');


/**
 * @memberOf task
 */
class CreateSvgSpritesheetTask extends BaseTask
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'task/CreateSvgSpritesheetTask';
    }


    /**
     * @returns {Stream}
     */
    stream(stream, buildConfiguration, parameters)
    {
        if (!stream)
        {
            return super.stream(stream, buildConfiguration, parameters);
        }

        const work = this._cliLogger.work('Creating svg spritesheet from files');
        const params = parameters || {};
        const options =
        {
            mode:
            {
                symbol:
                {
                    dest: '',
                    sprite: params.spriteName || 'sprite.svg'
                }
            }
        };
        const resultStream = stream.pipe(svgSprite(options));
        resultStream.on('finish', () =>
        {
            this._cliLogger.end(work);
        });

        return resultStream;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CreateSvgSpritesheetTask = CreateSvgSpritesheetTask;
