"use strict";

/**
 * Requirements
 */
let Context = require(SOURCE_ROOT + '/application/Context.js').Context;
let GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
let PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
let SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
let EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
let EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
let IdParser = require(SOURCE_ROOT + '/parser/entity/IdParser.js').IdParser;
let LintCommand = require(SOURCE_ROOT + '/command/LintCommand.js').LintCommand;
let JsFileLinter = require(SOURCE_ROOT + '/linter/JsFileLinter.js').JsFileLinter;
let JsLinter = require(SOURCE_ROOT + '/linter/JsLinter.js').JsLinter;
let compact = require(FIXTURES_ROOT + '/Application/Compact.js');
let co = require('co');


/**
 * Spec
 */
describe(Context.className, function()
{
    beforeEach(function()
    {
        try
        {
            fixtures = compact.createFixture();
        }
        catch(e)
        {
            console.log(e);
        }
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new Context();
            expect(testee.className).to.be.equal('application/Context');
        });
    });


    describe('#constructor', function()
    {
        it('should map a GlobalConfiguration instance that is configurable via configuration.settings', function()
        {
            let testee = new Context(fixtures.configuration);
            let globals = testee.di.create(GlobalConfiguration);
            expect(globals.get('breakpoints.desktop.minWidth')).to.be.equal('1200px');
        });

        it('should map a PathesConfiguration instance that is configurable via configuration.pathes', function()
        {
            let testee = new Context(fixtures.configuration);
            let pathes = testee.di.create(PathesConfiguration);
            expect(pathes.root).to.be.equal(fixtures.configuration.pathes.root);
        });

        it('should map a SitesRepository instance that is configurable via configuration.sites', function()
        {
            let testee = new Context(fixtures.configuration);
            let sites = testee.di.create(SitesRepository);
            expect(sites.loader).to.be.instanceof(fixtures.configuration.sites.loader.type);
            expect(sites.loader.plugins).to.have.length(2);
        });

        it('should map a EntityCategoriesRepository instance that is configurable via configuration.entityCategories', function()
        {
            let testee = new Context(fixtures.configuration);
            let categories = testee.di.create(EntityCategoriesRepository);
            expect(categories.loader).to.be.instanceof(fixtures.configuration.entityCategories.loader.type);
            expect(categories.loader.plugins).to.have.length(0);
        });

        it('should map a IdParser instance that is configurable via configuration.entities.idParser', function()
        {
            let testee = new Context(fixtures.configuration);
            let parser = testee.di.create(IdParser);
            expect(parser).to.be.instanceof(fixtures.configuration.entities.idParser);
        });

        it('should map a EntitiesRepository instance that is configurable via configuration.entities', function()
        {
            let testee = new Context(fixtures.configuration);
            let entities = testee.di.create(EntitiesRepository);
            expect(entities.loader).to.be.instanceof(fixtures.configuration.entities.loader.type);
            expect(entities.loader.plugins).to.have.length(6);
        });

        it('should map each Command configured via configuration.commands', function()
        {
            let testee = new Context(fixtures.configuration);
            let commands = testee.di.create('application/Runner.commands');
            expect(commands).to.have.length(5);

            let commandType = commands.find(type => type === LintCommand);
            expect(commandType).to.be.ok;

            let command = testee.di.create(commandType);
            expect(command.linters).to.have.length(1);

            let linter = command.linters.find(linter => linter instanceof JsFileLinter);
            expect(linter).to.be.ok;
            expect(linter.linter).to.be.instanceof(JsLinter);
            expect(Object.keys(linter.linter.rules).length).to.be.above(1);
        });
    });


    describe('.instance', function()
    {
        it('should throw an error when no context was initialized', function()
        {
            Context._instance = undefined; /* Bad, but hey.... */
            expect(function() { Context.instance; }).to.throw(Error);
        });

        it('should return the last initialized context', function()
        {
            Context._instance = undefined; /* Bad, but hey.... */
            let testee = new Context(fixtures.configuration);
            expect(Context.instance).to.equal(testee);
        });
    });


    describe('wiring', function()
    {
        it('should allow to get a list of Site(s)', function()
        {
            let testee = new Context(fixtures.configuration);
            let promise = co(function *()
            {
                let sites = testee.di.create(SitesRepository);
                let items = yield sites.getItems();
                let base = items.find(item => item.name == 'Base');
                let extended = items.find(item => item.name == 'Extended');
                expect(items.length).to.be.equal(2);
                expect(base).to.be.ok;
                expect(extended).to.be.ok;
                expect(extended.extends).to.be.equal(base);
            });
            return promise;
        });

        it('should allow to get a list of EntityCategory(s)', function()
        {
            let testee = new Context(fixtures.configuration);
            let promise = co(function *()
            {
                let categories = testee.di.create(EntityCategoriesRepository);
                let items = yield categories.getItems();
                expect(items.length).to.be.equal(7);
                expect(items.find(item => item.longName == 'Element')).to.be.ok;
                expect(items.find(item => item.longName == 'Page Type')).to.be.ok;
                expect(items.find(item => item.longName == 'Common')).to.be.ok;
            });
            return promise;
        });

        it('should allow to get a list of Entity(s)', function()
        {
            let testee = new Context(fixtures.configuration);
            let promise = co(function *()
            {
                let entities = testee.di.create(EntitiesRepository);
                let items = yield entities.getItems();
                expect(items.length).to.be.equal(3);
                expect(items.find(item => item.id.name == 'gallery')).to.be.ok;
                expect(items.find(item => item.id.name == 'button')).to.be.ok;
                expect(items.find(item => item.id.category.longName == 'Common')).to.be.ok;
            });
            return promise;
        });
    });
});
