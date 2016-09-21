'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const html = require('../gulp/task/html.js');
const utils = require('./utils.js');


/**
 * @memberOf command
 */
class HtmlCommand extends BaseCommand
{
    /**
     *
     */
    constructor(context)
    {
        super(context);

        // Assign options
        this._name = 'html';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/HtmlCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Genrates HTML files for modules',
            actions:
            [
                {
                    name: 'compile',
                    description: 'Compiles all html files for the given query'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    compile(parameters)
    {
        const logger = this.createLogger('command.html.compile');
        const section = logger.section('Compiling html');
        const promise = utils.runTask(html.compile, this.context.parameters._[2] || '*')
            .then(() => logger.end(section));
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        return this.compile(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.HtmlCommand = HtmlCommand;
