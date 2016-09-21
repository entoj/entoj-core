"use strict";

/**
 * Requirements
 */
let EntityCategoriesLoader = require(SOURCE_ROOT + '/model/entity/EntityCategoriesLoader.js').EntityCategoriesLoader;
const MissingArgumentError = require(SOURCE_ROOT + '/error/MissingArgumentError.js').MissingArgumentError;
const baseLoaderSpec = require('../BaseLoaderShared.js').spec;
let co = require('co');
let compact = require(FIXTURES_ROOT + '/Entities/Compact.js');


/**
 * Spec
 */
describe(EntityCategoriesLoader.className, function()
{
    baseLoaderSpec(EntityCategoriesLoader, 'model.entity/EntityCategoriesLoader');


    beforeEach(function()
    {
        fixtures = compact.createFixture();
    });


    describe('#load', function()
    {
        it('should resolve to EntityCategory instances that are configurable via categories', function()
        {
            let testee = new EntityCategoriesLoader(
            [
                {
                    longName: 'Element'
                },
                {
                    longName: 'Common',
                    pluralName: 'Common',
                    isGlobal: true
                }
            ]);
            let promise = co(function *()
            {
                const items = yield testee.load();
                expect(items.length).to.be.equal(2);
                expect(items.find(item => item.longName === 'Element')).to.be.ok;
                expect(items.find(item => item.longName === 'Common')).to.be.ok;
            });
            return promise;
        });
    });
});
