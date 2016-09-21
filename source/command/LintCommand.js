'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseCommand = require('./BaseCommand.js').BaseCommand;
const Context = require('../application/Context.js').Context;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const assertParameter = require('../utils/assert.js').assertParameter;
const chalk = require('chalk');
const co = require('co');


/**
 * @memberOf command
 */
class LintCommand extends BaseCommand
{
    /**
     */
    constructor(context, globalRepository, pathesConfiguration, linters)
    {
        super(context);

        //Check params
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._name = 'lint';
        this._globalRepository = globalRepository;
        this._pathesConfiguration = pathesConfiguration;
        this._linters = linters;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, GlobalRepository, PathesConfiguration, 'command/LintCommand.linters'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/LintCommand';
    }


    /**
     * @inheritDocs
     */
    get linters()
    {
        return this._linters;
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Lints files',
            actions: []
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    lint(parameters)
    {
        const scope = this;
        const logger = scope.createLogger('command.lint');
        const promise = co(function *()
        {
            const query = parameters.action || '*';
            const section = logger.section('Linting <' + query + '>');

            const entities = yield scope._globalRepository.resolveEntities(query);
            for (const entity of entities)
            {
                const entityPath = yield scope._pathesConfiguration.resolveEntityForSite(entity.entity, entity.site);
                const result =
                {
                    success: true,
                    errorCount: 0,
                    warningCount: 0,
                    messages: [],
                    files: []
                };
                const work = logger.work();
                for (const linter of scope.linters)
                {
                    const linterResult = yield linter.lint(entityPath);
                    if (!linterResult.success)
                    {
                        result.success = false;
                    }
                    result.errorCount+= linterResult.errorCount;
                    result.warningCount+= linterResult.warningCount;
                    Array.prototype.push.apply(result.messages, linterResult.messages);
                    Array.prototype.push.apply(result.files, linterResult.files);
                }
                if (result.success)
                {
                    logger.end(work, false, 'Linting <' + entity.id.asString('path') + '>');
                }
                else
                {
                    logger.end(work, true, 'Linting <' + entity.id.asString('path') + '> failed with <' + result.errorCount + '> errors and <' + result.warningCount + '> warnings.');

                    //Show messages
                    for (const message of result.messages)
                    {
                        logger.info(message.filename.replace(scope._pathesConfiguration.root, '') + '@' + message.line);
                        logger.info(message.message + chalk.dim(' (' + message.ruleId + ')'));
                    }
                }
            }

            logger.end(section);
        })
        .catch(function(e)
        {
            logger.error(e);
        });
        return promise;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        return this.lint(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.LintCommand = LintCommand;
