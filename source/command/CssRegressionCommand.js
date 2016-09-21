'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const PathesConfiguration = require('../model/configuration/PathesConfiguration').PathesConfiguration;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const co = require('co');
const driver = require('node-phantom-promise');
const phantomjs = require('phantomjs');


/**
 * @memberOf command
 */
class CssRegressionCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context, options)
    {
        super(context);

        this._name = 'cssregression';
        this._options = options || {};
        this._browser = false;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'command/CssRegressionCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/CssRegressionCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Provides css regression testing',
            actions:
            [
                {
                    name: 'start',
                    options: [],
                    description: 'Start the server'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Page>}
     */
    openUrl(url, logger)
    {
        const promise = new Promise(function (resolve, reject)
        {
            logger.info('Creating phantom instance');
            let page;
            let browser;
            driver.create(
                {
                    path: phantomjs.path,
                    parameters:
                    {
                        'ignore-ssl-errors': 'yes'
                    }
                })
            .then(function(b)
            {
                browser = b;
                return browser.createPage();
            })
            .then(function(p)
            {
                logger.info('Opening <' + url + '>');
                page = p;
                return page.open(url);
            })
            .then(function(status)
            {
                page.onConsoleMessage = function(msg)
                {
                    //logger.info('PhantomJS - ', msg);
                    if (msg.indexOf('PhantomJS::ready') > -1)
                    {
                        logger.info('Page is ready');
                        resolve({ instance:browser , page: page });
                    }
                };
                //@todo timeout & status handling
            })
            .catch(function(e)
            {
                logger.error(e);
                resolve(false);
            });
        });

        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Page>}
     */
    screenshot(page, selector, width, filename, logger)
    {
        const promise = co(function *()
        {
            logger.info('Creating screenshot for <' + selector + '> at <' + width +'px>');

            yield page.set('viewportSize',
                {
                    width: width,
                    height: 600
                });
            const clientRect = yield page.evaluate(function(document)
            {
                return document.querySelector('.m002-brandheader').getBoundingClientRect();
            });

            page.clipRect =
            {
                top: clientRect.top,
                left: clientRect.left,
                width: clientRect.width,
                height: clientRect.height
            };

            yield page.render(filename);

            return true;
        });

        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    update(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.cssregression');
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const globalConfiguration = scope.context.di.create(GlobalConfiguration);
            const breakpoints = globalConfiguration.get('breakpoints');
            const screenWidths = [];
            for (const name in breakpoints)
            {
                const breakpoint = breakpoints[name];
                if (breakpoint.minWidth)
                {
                    screenWidths.push(parseInt(breakpoint.minWidth, 10));
                }
                if (breakpoint.maxWidth)
                {
                    screenWidths.push(parseInt(breakpoint.maxWidth, 10));
                }
            }
            screenWidths.sort();

            const url = 'https://localhost:3000/base/modules/m002-brandheader/examples/overview.j2';
            const selectors = ['.m002-brandheader'];

            const browser = yield scope.openUrl(url, logger);

            for (const screenWidth of screenWidths)
            {
                for (const selector of selectors)
                {
                    //const filename = pathesConfiguration.cache + '/cssregression/m002-brandheader-' + screenWidth + '-' + crc32.str(selector).toString(16) + '.png';
                    const filename = pathesConfiguration.cache + '/cssregression/m002-brandheader-' + screenWidth + '-' + '.png';
                    yield scope.screenshot(browser.page, selector, screenWidth, filename, logger);
                }
            }

            browser.instance.exit(0);

            return true;
        });

        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        return this.update();
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionCommand = CssRegressionCommand;
