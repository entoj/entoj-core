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
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const Site = require('../model/site/Site.js').Site;
const SitesRepository = require('../model/site/SitesRepository.js').SitesRepository;
const IdParser = require('../parser/entity/IdParser.js').IdParser;
const ReadFilesTask = require('../task/ReadFilesTask.js').ReadFilesTask;
const RenameFilesTask = require('../task/RenameFilesTask.js').RenameFilesTask;
const TemplateTask = require('../task/TemplateTask.js').TemplateTask;
const WriteFilesTask = require('../task/WriteFilesTask.js').WriteFilesTask;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const co = require('co');
const inquirer = require('inquirer');


/**
 * @memberOf command
 */
class ScaffoldPageCommand extends BaseCommand
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
        return { 'parameters': [Context, 'command/ScaffoldPageCommand.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/ScaffoldPageCommand';
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
                    name: 'page [siteName] [pageName]',
                    description: 'Scaffolds a page'
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Object>}
     */
    askQuestions(logger, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const entityIdParser = scope.context.di.create(IdParser);
            const sitesRepository = scope.context.di.create(SitesRepository);
            const sites = yield sitesRepository.getItems();

            // Parse & prepare parameters
            const values =
            {
                site: undefined,
                entityId: undefined
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
                    message: 'The page id?',
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
                            return 'Please enter a valid page id (e.g. p-home)';
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
                }
            ];
            const answers = yield inquirer.prompt(questions);

            // Prepare result
            values.entityId.entityId.site = values.site;
            const result =
            {
                entityId: values.entityId.entityId,
                site: values.site
            };
            return result;
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
        if (parameters.action !== 'page')
        {
            return Promise.resolve(false);
        }

        const scope = this;
        const logger = scope.createLogger('command.scaffold.page');
        const promise = co(function *()
        {
            // Prepare
            const section = logger.section('Scaffolding page');
            const configuration = yield scope.askQuestions(logger, parameters);

            // Create tasks
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            const options =
            {
                writePath: yield pathesConfiguration.resolveEntityId(configuration.entityId),
                readPath: scope._templatePath + '/**/*.*',
                readPathBase: scope._templatePath,
                templateData:
                {
                    entityId: configuration.entityId,
                    site: configuration.site
                },
                renameFiles:
                {
                    '(.*)entityId\.(.*)': '$1' + configuration.entityId.asString('id') + '.$2'
                }
            };
            logger.options(options);
            yield scope.context.di.create(ReadFilesTask, mapping)
                .pipe(scope.context.di.create(TemplateTask, mapping))
                .pipe(scope.context.di.create(RenameFilesTask, mapping))
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, options);

            // Done
            logger.end(section);
        })
        .catch(function(error)
        {
            logger.error(error);
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ScaffoldPageCommand = ScaffoldPageCommand;
