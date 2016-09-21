'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const Context = require('../application/Context.js').Context;
const GlobalConfiguration = require('../model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
const EntityId = require('../model/entity/EntityId.js').EntityId;
const EntitiesRepository = require('../model/entity/EntitiesRepository.js').EntitiesRepository;
const Environment = require('../nunjucks/Environment.js').Environment;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const co = require('co');
const glob = require('co-glob');
const fs = require('co-fs-extra');
const path = require('path');
const thunkify = require('thunkify');
const inquirer = require('inquirer');
const synchronize = require('../utils/synchronize.js');


/**
 * Base class for Parsers.
 */
class Scaffolder extends Base
{
    /**
     * @param {Context} context
     * @param {object|undefined} options
     */
    constructor(context, cliLogger, options)
    {
        super();

        // Assign options
        const opts = options || {};
        this._context = context;
        this._templateRoot = opts.templateRoot || '';
        this._cliLogger = cliLogger.createPrefixed('scaffolder');

        // Inquirer promise
        this._inquirerPrompt = thunkify(function(questions, callback)
        {
            inquirer.prompt(questions, function(answers)
            {
                callback(null, answers);
            });
        });
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, CliLogger, 'scaffold/Scaffolder.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'scaffold/Scaffolder';
    }


    /**
     * @param {*} configuration
     * @returns {Promise<Boolean>}
     */
    createEnvironment(rootPath)
    {
        const entitiesRepository = this._context.di.create(EntitiesRepository);
        const pathesConfiguration = this._context.di.create(PathesConfiguration);
        const globalConfiguration = this._context.di.create(GlobalConfiguration);
        const buildConfiguration = this._context.di.create(BuildConfiguration);
        const environment = new Environment(entitiesRepository, globalConfiguration, pathesConfiguration, buildConfiguration,
            {
                rootPath: rootPath,
                tags:
                {
                    blockStart: '<%',
                    blockEnd: '%>',
                    variableStart: '<$',
                    variableEnd: '$>',
                    commentStart: '<#',
                    commentEnd: '#>'
                }
            });
        return Promise.resolve(environment);
    }


    /**
     * @param {*} configuration
     * @returns {Promise<Boolean>}
     */
    entity(entityId, javascript)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Get root path
            const pathesConfiguration = scope._context.di.create(PathesConfiguration);
            const rootPath = yield pathesConfiguration.resolveEntityId(entityId);
            scope._cliLogger.info('Scaffolding to <' + synchronize.execute(pathesConfiguration, 'shorten', [rootPath]) + '>');

            // Get template
            scope._cliLogger.info('Templates from <' + synchronize.execute(pathesConfiguration, 'shorten', [scope._templateRoot]) + '>');
            let templatePath = scope._templateRoot + '/entity/' + entityId.category.longName.toLowerCase();
            let templatePathExists = yield fs.exists(templatePath);
            if (!templatePathExists)
            {
                templatePath = scope._templateRoot + '/entity/default';
                templatePathExists = yield fs.exists(templatePath);
            }
            if (!templatePathExists)
            {
                return { error: 'Could not find a appropriate template' };
            }
            scope._cliLogger.info('Using template <' + synchronize.execute(pathesConfiguration, 'shorten', [templatePath]) + '>');

            // Prepare nunjucks
            const environment = yield scope.createEnvironment(__dirname);

            // Render files
            const files = yield glob('/**/*.*', { root: templatePath, nodir: true });
            const data =
            {
                site: entityId.site,
                entityCategory: entityId.category,
                entityId: entityId
            };
            for (const file of files)
            {
                if (file == __filename)
                {
                    continue;
                }
                if (!javascript && file.endsWith('.js'))
                {
                    continue;
                }

                const filepath = file.replace(templatePath, '').replace('entityId', entityId.asString(EntityId.ID));
                const filename = rootPath + filepath;
                const fullpath = path.dirname(filename);

                const work = scope._cliLogger.work('Generating <' + filepath + '>');

                const content = yield fs.readFile(file, { encoding: 'utf8' });
                const rendered = environment.renderString(content, data);

                yield fs.mkdirp(fullpath);
                yield fs.writeFile(filename, rendered, { encoding: 'utf8' });

                scope._cliLogger.end(work);
            }
            return true;
        });
        return promise;
    }


    /**
     * @returns {Promise<Boolean>}
     */
    breakpoint(breakpoints)
    {
        const scope = this;
        const promise = co(function *()
        {
            const pathesConfiguration = scope._context.di.create(PathesConfiguration);
            const environment = yield scope.createEnvironment(__dirname);

            // Get template
            scope._cliLogger.info('Templates from <' + synchronize.execute(pathesConfiguration, 'shorten', [scope._templateRoot]) + '>');
            const templatePath = scope._templateRoot + '/breakpoint';
            const templatePathExists = yield fs.exists(templatePath);
            if (!templatePathExists)
            {
                return { error: 'Could not find a appropriate template' };
            }
            scope._cliLogger.info('Using template <' + synchronize.execute(pathesConfiguration, 'shorten', [templatePath]) + '>');

            // Get config
            const configurationPath = templatePath + '/configuration.json';
            const configurationPathExists = yield fs.exists(configurationPath);
            if (!configurationPathExists)
            {
                return { error: 'Could not find the template configuration' };
            }
            scope._cliLogger.info('Using configuration <' + synchronize.execute(pathesConfiguration, 'shorten', [configurationPath]) + '>');
            const configurationContent = yield fs.readFile(configurationPath, { encoding: 'utf-8' });
            const configuration = JSON.parse(configurationContent);

            // Render
            const data = { breakpoints: breakpoints };
            for (const file of configuration.files)
            {
                const templateFilename = templatePath + '/' + file.template;
                const targetFilename = pathesConfiguration.root + '/' + file.file;

                const work = scope._cliLogger.work('Generating <' + synchronize.execute(pathesConfiguration, 'shorten', [targetFilename]) + '>');

                const content = yield fs.readFile(templateFilename, { encoding: 'utf8' });
                const rendered = environment.renderString(content, data);
                yield fs.mkdirp(path.dirname(targetFilename));
                yield fs.writeFile(targetFilename, rendered, { encoding: 'utf8' });

                scope._cliLogger.end(work);
            }

            return true;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Scaffolder = Scaffolder;
