'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const EntityId = require('../model/entity/EntityId.js').EntityId;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const Site = require('../model/site/Site.js').Site;
const SitesRepository = require('../model/site/SitesRepository.js').SitesRepository;
const IdParser = require('../parser/entity/IdParser.js').IdParser;
const co = require('co');
const inquirer = require('inquirer');


/**
 * @memberOf command
 */
class ScaffoldCommand extends BaseCommand
{
    /**
     */
    constructor(context, options)
    {
        super(context);

        // Assign options
        this._name = 'scaffold';
        this._options = options || {};
        this._templatePath = this._options.templatePath || '';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'command/ScaffoldCommand.options'] };
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
            // Prepare
            const entityIdParser = scope.context.di.create(IdParser);
            const sitesRepository = scope.context.di.create(SitesRepository);
            const section = logger.section('Creating entity scaffolding');
            const sites = yield sitesRepository.getItems();

            // Parse & prepare parameters
            const values =
            {
                site: undefined,
                entityId: undefined,
                javascript: parameters.javascript,
                entityPath: undefined
            };
            if (parameters._.length == 1)
            {
                values.entityId = yield entityIdParser.parse(parameters._[0]);
            }
            else if (parameters._.length == 2)
            {
                values.site = yield sitesRepository.findBy(Site.NAME, parameters._[0]);
                values.entityId = yield entityIdParser.parse(parameters._[1]);
            }
            if (values.entityId)
            {
                if (sites.length === 1)
                {
                    values.site = sites[0];
                }
            }

            // Ask questions
            const questions =
            [
                {
                    type: 'input',
                    name: 'entityId',
                    message: 'The entity id?',
                    validate: function(value)
                    {
                        const promise = co(function *()
                        {
                            values.entityId = yield entityIdParser.parse(value);
                            if (values.entityId)
                            {
                                if (sites.length === 1)
                                {
                                    values.site = sites[0];
                                }
                                return true;
                            }
                            return 'Please enter a valid entity id (e.g. m-gallery)';
                        });
                        return promise;
                    },
                    when: function()
                    {
                        const hasData = (values.entityId);
                        return Promise.resolve(!hasData);
                    }
                },
                {
                    type: 'list',
                    name: 'site',
                    message: 'Select a site',
                    choices: yield sitesRepository.getPropertyList(Site.NAME),
                    when: function()
                    {
                        const hasData = (values.site);
                        return Promise.resolve(!hasData);
                    }
                },
                {
                    type: 'confirm',
                    name: 'javascript',
                    message: 'Does it need JavaScript?',
                    default: true,
                    when: function()
                    {
                        const hasData = (values.javascript);
                        return Promise.resolve(!hasData);
                    }
                }
            ];
            const answers = yield inquirer.prompt(questions);

            // Update values
            values.javascript = answers.javascript;

            // Create tasks
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const templatePath = yield pathesConfiguration.resolveCache('/css');
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            yield scope.context.di.create(TemplateTask, mapping)
                .pipe(scope.context.di.create(Task, mapping))
                .run(buildConfiguration, { readPath: path });

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
        return this.entity(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ScaffoldCommand = ScaffoldCommand;
