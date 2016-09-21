'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const CliLogger = require('../cli/CliLogger.js').CliLogger;
const co = require('co');
const RedmineApi = require('promised-redmine');


/**
 *
 */
class Redmine extends Base
{
    /**
     * @param {CliLogger} cliLogger
     * @param {object|undefined} options
     */
    constructor(cliLogger, options)
    {
        super();

        // Assign options
        const opts = options || {};
        this._cliLogger = cliLogger;
        this._apiKey = opts.apiKey;
        this._host = opts.host || 'issues-tracker.syzygy.de';
        this._protocol = opts.protocol || 'https';
        this._project = opts.project || '0';
        this._trackers =
        {
            overview: 6,
            qs: 16,
            task: 12
        };
        if (opts.trackers)
        {
            this._trackers = opts.trackers;
        }
        this._tasksOverview = opts.tasksOverview || 'Umsetzung';
        this._tasks =
        [
            'SCSS',
            'HTML',
            'JavaScript'
        ];
        if (opts.tasks)
        {
            this._tasks = opts.tasks;
        }
        this._devicesOverview = opts.devicesOverview || 'QS';
        this._devices = [];
        if (opts.devices)
        {
            this._devices = opts.devices;
        }
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, 'bugtracker/Redmine.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'bugtracker/Redmine';
    }


    /**
     * @inheritDoc
     */
    get api()
    {
        if (!this._api)
        {
            const config =
            {
                host: this._host,
                apiKey:  this._apiKey,
                protocol: this._protocol
            };
            this._api = new RedmineApi(config);
        }
        return this._api;
    }


    /**
     * @inheritDoc
     */
    ensureTicket(subject, trackerId, parentId)
    {
        const scope = this;
        const promise = co(function*()
        {
            let result;
            const found = yield scope.api.getIssues(
                {
                    'project_id': scope._project,
                    'subject': subject
                });
            if (found.issues.length)
            {
                result = found.issues[0];
            }
            else
            {
                const created = yield scope.api.postIssue(
                    {
                        'project_id': scope._project,
                        'tracker_id': trackerId,
                        'parent_issue_id': parentId,
                        'subject': subject
                    });
                result = created.issue;
            }
            return result;
        });
        return promise;
    }


    /**
     * @inheritDoc
     */
    createForEntity(siteName, categoryName, entityName)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Create site
            const createSite = scope._cliLogger.work('Created site <' + siteName + '> overview ticket');
            const siteIssue = yield scope.ensureTicket(siteName, scope._trackers.overview);
            if (!siteIssue)
            {
                throw new Error('Could not create/find site issue');
            }
            scope._cliLogger.end(createSite);

            // Create category
            const createCategory = scope._cliLogger.work('Created category <' + categoryName + '> overview ticket');
            const categoryIssue = yield scope.ensureTicket(siteName + ' // ' + categoryName,
                scope._trackers.overview,
                siteIssue.id);
            if (!categoryIssue)
            {
                throw new Error('Could not create/find category issue');
            }
            scope._cliLogger.end(createCategory);

            // Create entity
            const createEntity = scope._cliLogger.work('Created entity <' + entityName + '> overview ticket');
            const entityIssue = yield scope.ensureTicket(siteName + ' // ' + categoryName + ' // ' + entityName,
                scope._trackers.overview,
                categoryIssue.id);
            if (!entityIssue)
            {
                throw new Error('Could not create/find entity issue');
            }
            scope._cliLogger.end(createEntity);

            // Create Tasks
            if (scope._tasks.length > 0)
            {
                const createTasks = scope._cliLogger.work('Created task tickets');
                for (const task of scope._tasks)
                {
                    yield scope.ensureTicket(siteName + ' // ' + categoryName + ' // ' + entityName + ' // ' + task,
                        scope._trackers.task,
                        entityIssue.id);
                }
                scope._cliLogger.end(createTasks);
            }

            // Create QS
            if (scope._devices.length > 0)
            {
                const createTickets = scope._cliLogger.work('Created qs ticket');
                yield scope.ensureTicket(siteName + ' // ' + categoryName + ' // ' + entityName + ' // ' + scope._qsTask,
                    scope._trackers.task,
                    entityIssue.id);
                scope._cliLogger.endWork(createTickets);
            }
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Redmine = Redmine;
