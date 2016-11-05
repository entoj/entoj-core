"use strict";

/**
 * Requirements
 */
const BaseRepository = require(SOURCE_ROOT + '/model/BaseRepository.js').BaseRepository;
const nunjucks = require('nunjucks');
const synchronize = require(SOURCE_ROOT + '/utils/synchronize.js').synchronize;
const createMap = require(SOURCE_ROOT + '/utils/map.js').create;


/**
 * Spec
 */
describe('nunjucks/Integration', function()
{
    beforeEach(function()
    {
        fixtures.environment = new nunjucks.Environment();

        fixtures.map = createMap();
        fixtures.map.set('p', createMap());
        fixtures.map.get('p').set('s', 'secret');

        fixtures.repository = synchronize(new BaseRepository());
        fixtures.repository.add({ name: 'One'});
        fixtures.repository.add({ name: 'Two'});

        fixtures.className = function(type)
        {
            return type.className;
        }
    });


    describe('{{ map.property }}', function()
    {
        it('should be able to access maps via pathes', function()
        {
            const tpl = "Value:{{ map.p.s }}";
            const testee = fixtures.environment.renderString(tpl, { map: fixtures.map });
            expect(testee).to.contain('Value:secret');
        });
    });


    describe('{{ object.method() }}', function()
    {
        it('should be able to call methods', function()
        {
            const tpl = "Count:{{ repository.getItems().length }}";
            const testee = fixtures.environment.renderString(tpl, { repository: fixtures.repository });
            expect(testee).to.contain('Count:2');
        });
    });


    describe('{{ function(Class) }}', function()
    {
        it('should be able to call methods with class arguments', function()
        {
            const tpl = "Class:{{ className(BaseRepository) }}";
            const testee = fixtures.environment.renderString(tpl, { className: fixtures.className, BaseRepository: BaseRepository });
            expect(testee).to.contain('Class:model/BaseRepository');
        });
    });
});
