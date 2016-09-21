'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const Redmine = require('../bugtracker/Redmine.js').Redmine;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration').GlobalConfiguration;
const co = require('co');
const utils = require('./utils.js');


/**
 * @memberOf command
 */
class TicketCommand extends BaseCommand
{
    /**
     */
    constructor(context, options)
    {
        super(context);

        // Assign options
        this._options = options || {};
        this._name = 'ticket';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'command/TicketCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/TicketCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Creates or updates tickets for entities',
            actions:
            [
                {
                    name: 'create [siteName] entityName',
                    description: 'Creates a ticket for a entity.\nExample: entoj ' + this._name + ' create base e001-link'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    create(parameters)
    {
        const scope = this;
        const logger = scope.createLogger('command.ticket.create');
        const promise = co(function *()
        {
            const section = logger.section('Creating ticket');

            const query =
            {
                site: undefined,
                entityId: undefined
            };
            if (parameters._.length == 1)
            {
                query.entityId = parameters._[0];
            }
            else if (parameters._.length == 2)
            {
                query.site = parameters._[0];
                query.entityId = parameters._[1];
            }

            // Get entity
            const entityId = yield utils.inquireEntityId(query.site, query.entityId, scope.context.di);
            if (!entityId)
            {
                return Promise.reject('Could not find entity id');
            }

            // Create configuratoon
            const globalConfiguration = scope.context.di.create(GlobalConfiguration);
            const options = {};
            options.tests = globalConfiguration.get('tests', []);
            options.breakpoints = Object.keys(globalConfiguration.get('breakpoints', {}));
            Object.assign(options, scope._options);
            Object.assign(options, entityId.site.properties.getByPath('redmine', {}));

            // Create tickets
            const redmineOptions = new Map();
            redmineOptions.set(Redmine.className + '.options', options);
            const redmine = scope.context.di.create(Redmine, redmineOptions);
            yield redmine.createForEntity(entityId.site.name, entityId.category.pluralName, entityId.asString());

            // Done
            logger.end(section);
        })
        .catch(function(error)
        {
            logger.error(error);
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        return this.create(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TicketCommand = TicketCommand;
