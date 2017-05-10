'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const co = require('co');
const Nightmare = require('nightmare');


/**
 * @memberOf cssregression
 */
class Screenshot extends Base
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'cssregression/Screenshot';
    }


    /**
     * @returns {Promise<Buffer>}
     */
    create(url, width)
    {
        const promise = co(function *()
        {
            const nightmare = new Nightmare();
            yield nightmare.goto(url);
            yield nightmare.wait('body');
            yield nightmare.viewport(width, 1024);
            const contentHeight = yield nightmare
                .wait(250)
                .evaluate(() =>
                {
                    const body = document.querySelector('body');
                    return body.scrollHeight;
                });
            yield nightmare.viewport(width, contentHeight);
            yield nightmare.wait(1000);
            const buffer = yield nightmare.screenshot();
            yield nightmare.end();

            // Done
            return buffer;
        })
        .catch((e) =>
        {
            this.logger.error(e);
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Screenshot = Screenshot;
