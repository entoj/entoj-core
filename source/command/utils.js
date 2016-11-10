'use strict';

/**
 * Requirements
 * @ignore
 */
const co = require('co');
const fs = require('co-fs-extra');
const inquirer = require('inquirer');
const Site = require('../model/site/Site.js').Site;
const SitesRepository = require('../model/site/SitesRepository.js').SitesRepository;
const IdParser = require('../parser/entity/IdParser.js').IdParser;
const synchronize = require('../utils/synchronize.js');


/**
 * Inquirer prompt
 */
function inquire(questions)
{
    return inquirer.prompt(questions);
}


/**
 * Asks to answer question with yes or no.
 */
function inquireBoolean(query, question)
{
    if (typeof query === 'boolean')
    {
        return Promise.resolve(query);
    }

    const promise = co(function *()
    {
        const question_ =
        {
            type: 'list',
            name: 'boolean',
            message: question,
            choices: ['Yes', 'No'],
            filter: function(value)
            {
                return value === 'Yes';
            }
        };
        const selection = yield inquire([question_]);
        return selection.boolean;
    });
    return promise;
}


/**
 * Asks the user to select a site
 */
function inquireSite(query, di)
{
    const promise = co(function *()
    {
        const sitesRepository = di.create(SitesRepository);

        // See if query is fine
        if (query)
        {
            const site = yield sitesRepository.findBy(Site.NAME, query);
            if (site)
            {
                return site;
            }
        }

        // Get first or select one
        const sites = yield sitesRepository.getItems();
        if (sites.length == 10)
        {
            return sites[0];
        }
        const question =
        {
            type: 'list',
            name: 'site',
            message: 'Select site',
            choices: yield sitesRepository.getPropertyList(Site.NAME)
        };
        const selection = yield inquire([question]);
        const site = yield sitesRepository.findBy(Site.NAME, selection.site);
        return site;
    });
    return promise;
}


/**
 * Asks the user fo entity id
 */
function inquireEntityId(siteQuery, entityIdQuery, di)
{
    const promise = co(function *()
    {
        const entityIdParser = di.create(IdParser);
        let entity = yield entityIdParser.parse(entityIdQuery);
        if (!entity)
        {
            const question =
            {
                type: 'input',
                name: 'entityId',
                message: 'What is the id of the entity?',
                validate: function(value)
                {
                    const id = synchronize.execute(entityIdParser, 'parse', [value]);
                    if (id)
                    {
                        return true;
                    }
                    return 'Please enter a valid entity id (e.g. m-gallery)';
                }
            };
            const selection = yield inquire([question]);
            entity = yield entityIdParser.parse(selection.entityId);
        }

        if (!entity)
        {
            return false;
        }

        if (!entity.site)
        {
            const site = yield inquireSite(siteQuery, di);
            if (!site)
            {
                return false;
            }
            entity.entityId.site = site;
        }

        return entity.entityId;
    });
    return promise;
}


/**
 * Asks the overwrite the file if it exists
 */
function inquireOverwrite(query, filename)
{
    if (query === true)
    {
        return Promise.resolve(true);
    }

    const promise = co(function *()
    {
        const exists = yield fs.exists(filename);
        if (exists)
        {
            const question =
            {
                type: 'list',
                name: 'overwrite',
                message: 'File ' + filename + ' already exists, do you want to overwrite it?',
                choices: ['Yes', 'No'],
                filter: function(value)
                {
                    return value === 'Yes';
                }
            };
            const selection = yield inquire([question]);
            return selection.overwrite;
        }
        return true;
    });
    return promise;
}


/**
 * Runs a gulp task
 *
 * @return {Promise}
 */
function runTask(task, ...params)
{
    const promise = new Promise(function(resolve)
    {
        const stream = task.apply(task, params);
        stream.on('end', function()
        {
            resolve();
        });
    });
    return promise;
}


module.exports.inquire = inquire;
module.exports.inquireBoolean = inquireBoolean;
module.exports.inquireSite = inquireSite;
module.exports.inquireEntityId = inquireEntityId;
module.exports.inquireOverwrite = inquireOverwrite;
module.exports.runTask = runTask;
