'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const EntityId = require('../model/entity/EntityId.js').EntityId;
const Scaffolder = require('../scaffold/Scaffolder.js').Scaffolder;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const co = require('co');
const utils = require('./utils.js');


/**
 * @memberOf command
 */
class ScaffoldCommand extends BaseCommand
{
    /**
     */
    constructor(context, globalConfiguration, pathesConfiguration, options)
    {
        super(context);

        // Assign options
        this._globalConfiguration = globalConfiguration;
        this._pathesConfiguration = pathesConfiguration;
        this._options = options || {};
        this._name = 'scaffold';
        this._templatePath = this._options.templatePath || '';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, GlobalConfiguration, PathesConfiguration, 'command/ScaffoldCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/ScaffoldCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Scaffolding',
            actions:
            [
                {
                    name: 'entity [siteName] entityName',
                    description: 'Scaffolds a entity\nExample: entoj.sh ' + this._name + ' entity base e001-link'
                },
                {
                    name: 'breakpoint',
                    description: 'Scaffolds all breakpoint related files\nExample: entoj.sh ' + this._name + ' breakpoint'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    entity(parameters)
    {
        const scope = this;
        const logger = scope.createLogger('command.scaffold.entity');
        const promise = co(function *()
        {
            const section = logger.section('Creating entity scaffolding');

            // Parse parameters
            const query =
            {
                site: undefined,
                entityId: undefined,
                javascript: parameters.javascript,
                overwrite: parameters.overwrite
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

            // Javascript
            const javascript = yield utils.inquireBoolean(query.javascript, 'Does the entity use JavaScript?');

            // Overwrite
            const entityPath = yield scope._pathesConfiguration.resolveEntityId(entityId);
            const overwrite = yield utils.inquireOverwrite(query.overwrite, entityPath);
            if (!overwrite)
            {
                return Promise.reject('Denied overwritting files...');
            }

            // Go
            logger.options(
                {
                    entityId: entityId.asString(EntityId.PATH),
                    javascript: javascript,
                    overwrite: overwrite
                });
            const scaffolderOptions = new Map();
            scaffolderOptions.set(Scaffolder.className + '.options', { templateRoot: scope._templatePath });
            const scaffolder = scope.context.di.create(Scaffolder, scaffolderOptions);
            const result = yield scaffolder.entity(entityId, javascript);
            if (result !== true)
            {
                logger.error(result.error);
            }

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
    breakpoint(parameters)
    {
        const scope = this;
        const logger = scope.createLogger('command.scaffold.breakpoint');
        const promise = co(function *()
        {
            const section = logger.section('Creating breakpoint scaffolding');

            // Create scaffolding
            const scaffolderOptions = new Map();
            scaffolderOptions.set(Scaffolder.className + '.options', { templateRoot: scope._templatePath });
            const scaffolder = scope.context.di.create(Scaffolder, scaffolderOptions);
            const result = yield scaffolder.breakpoint(scope._globalConfiguration.get('breakpoints'));
            if (result !== true)
            {
                logger.error(result.error);
            }

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
        if (parameters.action === 'breakpoint')
        {
            return this.breakpoint(parameters);
        }
        return this.entity(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ScaffoldCommand = ScaffoldCommand;
