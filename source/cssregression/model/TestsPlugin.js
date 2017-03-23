'use strict';

/**
 * Requirements
 * @ignore
 */
const LoaderPlugin = require('../../model/loader/LoaderPlugin.js').LoaderPlugin;
const PathesConfiguration = require('../../model/configuration/PathesConfiguration.js').PathesConfiguration;
const EntityAspect = require('../../model/entity/EntityAspect.js').EntityAspect;
const Test = require('./Test.js').Test;
const assertParameter = require('../../utils/assert.js').assertParameter;
const co = require('co');
const fs = require('fs');

/**
 *
 */
class TestsPlugin extends LoaderPlugin
{
    /**
     * @param {configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(pathesConfiguration)
    {
        super();

        //Check params
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._pathesConfiguration = pathesConfiguration;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'cssregression.model/TestsPlugin';
    }


    /**
     * @param {BaseValueObject} item
     */
    executeFor(item, site)
    {
        const scope = this;
        const promise = co(function*()
        {
            const s = site ? site : item.id.site;
            const entity = new EntityAspect(item, s);
            const settings = entity.properties.getByPath('testing.cssregression', []);
            if (settings.length)
            {
                let test = item.tests.getFirstByType(Test);
                if (!test)
                {
                    scope.logger.info('Creating new test for ' + entity.id.pathString);
                    test = new Test();
                    item.tests.push(test);
                }
                else
                {
                    scope.logger.info('Updating existing test for ' + entity.id.pathString);
                }
                test.name = 'cssregression';
                test.site = s;
                const stateFile = yield scope._pathesConfiguration.resolveEntityForSite(entity, s, '/tests/cssregression.json');
                if (fs.existsSync(stateFile))
                {
                    const state = JSON.parse(fs.readFileSync(stateFile, { encoding: 'utf8' }));
                    test.total = state.total;
                    test.ok = state.ok;
                    test.failed = state.failed;
                    test.tests = state.tests;
                }
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
module.exports.TestsPlugin = TestsPlugin;
