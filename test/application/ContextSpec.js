"use strict";

/**
 * Requirements
 */
const Context = require(SOURCE_ROOT + '/application/Context.js').Context;
const Base = require(SOURCE_ROOT + '/Base.js').Base;
const GlobalConfiguration = require(SOURCE_ROOT + '/model/configuration/GlobalConfiguration.js').GlobalConfiguration;
const PathesConfiguration = require(SOURCE_ROOT + '/model/configuration/PathesConfiguration.js').PathesConfiguration;
const SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
const EntityCategoriesRepository = require(SOURCE_ROOT + '/model/entity/EntityCategoriesRepository.js').EntityCategoriesRepository;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const IdParser = require(SOURCE_ROOT + '/parser/entity/IdParser.js').IdParser;
const LintCommand = require(SOURCE_ROOT + '/command/LintCommand.js').LintCommand;
const JsFileLinter = require(SOURCE_ROOT + '/linter/JsFileLinter.js').JsFileLinter;
const JsLinter = require(SOURCE_ROOT + '/linter/JsLinter.js').JsLinter;
const compact = require(FIXTURES_ROOT + '/Application/Compact.js');
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const co = require('co');


/**
 * Spec
 */
describe(Context.className, function()
{
    /**
     * Base Test
     */
    baseSpec(Context, 'application/Context');


    /**
     * Context Test
     */
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


    xdescribe('#constructor', function()
    {
        it('should map a GlobalConfiguration instance that is configurable via configuration.settings', function()
        {
            const testee = new Context(fixtures.configuration);
            const globals = testee.di.create(GlobalConfiguration);
            expect(globals.get('breakpoints.desktop.minWidth')).to.be.equal('1200px');
        });

        it('should map a PathesConfiguration instance that is configurable via configuration.pathes', function()
        {
            const testee = new Context(fixtures.configuration);
            const pathes = testee.di.create(PathesConfiguration);
            expect(pathes.root).to.be.equal(fixtures.configuration.pathes.root);
        });

        it('should map a SitesRepository instance that is configurable via configuration.sites', function()
        {
            const testee = new Context(fixtures.configuration);
            const sites = testee.di.create(SitesRepository);
            expect(sites.loader).to.be.instanceof(fixtures.configuration.sites.loader.type);
            expect(sites.loader.plugins).to.have.length(2);
        });

        it('should map a EntityCategoriesRepository instance that is configurable via configuration.entityCategories', function()
        {
            const testee = new Context(fixtures.configuration);
            const categories = testee.di.create(EntityCategoriesRepository);
            expect(categories.loader).to.be.instanceof(fixtures.configuration.entityCategories.loader.type);
            expect(categories.loader.plugins).to.have.length(0);
        });

        it('should map a IdParser instance that is configurable via configuration.entities.idParser', function()
        {
            const testee = new Context(fixtures.configuration);
            const parser = testee.di.create(IdParser);
            expect(parser).to.be.instanceof(fixtures.configuration.entities.idParser);
        });

        it('should map a EntitiesRepository instance that is configurable via configuration.entities', function()
        {
            const testee = new Context(fixtures.configuration);
            const entities = testee.di.create(EntitiesRepository);
            expect(entities.loader).to.be.instanceof(fixtures.configuration.entities.loader.type);
            expect(entities.loader.plugins).to.have.length(6);
        });

        it('should map each Command configured via configuration.commands', function()
        {
            const testee = new Context(fixtures.configuration);
            const commands = testee.di.create('application/Runner.commands');
            expect(commands).to.have.length(5);

            const commandType = commands.find(type => type === LintCommand);
            expect(commandType).to.be.ok;

            const command = testee.di.create(commandType);
            expect(command.linters).to.have.length(1);

            const linter = command.linters.find(linter => linter instanceof JsFileLinter);
            expect(linter).to.be.ok;
            expect(linter.linter).to.be.instanceof(JsLinter);
            expect(Object.keys(linter.linter.rules).length).to.be.above(1);
        });
    });


    xdescribe('.instance', function()
    {
        it('should throw an error when no context was initialized', function()
        {
            Context._instance = undefined; /* Bad, but hey.... */
            expect(function() { Context.instance; }).to.throw(Error);
        });

        it('should return the last initialized context', function()
        {
            Context._instance = undefined; /* Bad, but hey.... */
            const testee = new Context(fixtures.configuration);
            expect(Context.instance).to.equal(testee);
        });
    });


    xdescribe('#parameters', function()
    {
        it('should return a empty array when not configured', function()
        {
            delete fixtures.configuration.parameters;
            const testee = new Context(fixtures.configuration);
            expect(testee.parameters).to.be.deep.equal({});
        });

        it('should return the configured parameters', function()
        {
            fixtures.configuration.parameters =
            {
                command: 'server'
            };
            const testee = new Context(fixtures.configuration);
            expect(testee.parameters.command).to.be.equal('server');
        });
    });


    xdescribe('#configuration', function()
    {
        it('should return the configuration object used while instanciation', function()
        {
            const testee = new Context(fixtures.configuration);
            expect(testee.configuration).to.be.equal(fixtures.configuration);
        });
    });



    describe('mapping', function()
    {
        /**
         * Test classes
         */
        class Testee extends Base
        {
            constructor(stuff)
            {
                super();
                this.stuff = stuff;
            }

            static get injections()
            {
                return { parameters:['Testee.stuff'] };
            }

            static get className()
            {
                return 'Testee';
            }
        }

        class TesteeTwo extends Base
        {
            constructor(stuff)
            {
                super();
                this.stuff = stuff;
            }

            static get injections()
            {
                return { parameters:['TesteeTwo.stuff'] };
            }

            static get className()
            {
                return 'TesteeTwo';
            }
        }


        /**
         * Tests
         */
        xit('should allow to map global classes', function()
        {
            const configuration =
            {
                mappings:
                [
                    {
                        type: Testee,
                        stuff: 'Stuff'
                    }
                ]
            };
            const testee = new Context(configuration);
            const result = testee.di.create(Testee);
            expect(result).to.be.instanceof(Testee);
            expect(result.stuff).to.be.equal('Stuff');
            console.log(result);
        });


        xit('should allow to remap global classes', function()
        {
            const configuration =
            {
                mappings:
                [
                    {
                        sourceType: Testee,
                        type: TesteeTwo,
                        stuff: 'Stuff'
                    }
                ]
            };
            const testee = new Context(configuration);
            const result = testee.di.create(Testee);
            expect(result).to.be.instanceof(TesteeTwo);
            expect(result.stuff).to.be.equal('Stuff');
        });


        it('should allow to configure options through !{name} that will get instanciated via di', function()
        {
            const configuration =
            {
                mappings:
                [
                    {
                        type: Testee,
                        '!stuff':
                        [
                            TesteeTwo,
                            {
                                type: TesteeTwo,
                                stuff: 'One'
                            }
                        ]
                    }
                ]
            };
            const testee = new Context(configuration);
            const result = testee.di.create(Testee);
            expect(result).to.be.instanceof(Testee);
            expect(result.stuff).to.be.instanceof(Array);
            expect(result.stuff).to.have.length(2);
            expect(result.stuff[0]).to.be.instanceof(TesteeTwo);
            expect(result.stuff[0].stuff).to.be.undefined;
            expect(result.stuff[1]).to.be.instanceof(TesteeTwo);
            expect(result.stuff[1].stuff).to.be.equal('One');
        });
    });


    xdescribe('wiring', function()
    {
        it('should allow to get a list of Site(s)', function()
        {
            const testee = new Context(fixtures.configuration);
            const promise = co(function *()
            {
                const sites = testee.di.create(SitesRepository);
                const items = yield sites.getItems();
                const base = items.find(item => item.name == 'Base');
                const extended = items.find(item => item.name == 'Extended');
                expect(items.length).to.be.equal(2);
                expect(base).to.be.ok;
                expect(extended).to.be.ok;
                expect(extended.extends).to.be.equal(base);
            });
            return promise;
        });

        it('should allow to get a list of EntityCategory(s)', function()
        {
            const testee = new Context(fixtures.configuration);
            const promise = co(function *()
            {
                const categories = testee.di.create(EntityCategoriesRepository);
                const items = yield categories.getItems();
                expect(items.length).to.be.equal(7);
                expect(items.find(item => item.longName == 'Element')).to.be.ok;
                expect(items.find(item => item.longName == 'Page Type')).to.be.ok;
                expect(items.find(item => item.longName == 'Common')).to.be.ok;
            });
            return promise;
        });

        it('should allow to get a list of Entity(s)', function()
        {
            const testee = new Context(fixtures.configuration);
            const promise = co(function *()
            {
                const entities = testee.di.create(EntitiesRepository);
                const items = yield entities.getItems();
                expect(items.length).to.be.equal(3);
                expect(items.find(item => item.id.name == 'gallery')).to.be.ok;
                expect(items.find(item => item.id.name == 'button')).to.be.ok;
                expect(items.find(item => item.id.category.longName == 'Common')).to.be.ok;
            });
            return promise;
        });
    });
});
