"use strict";

/**
 * Requirements
 */
const ExamplesArgumentBuilder = require(SOURCE_ROOT + '/server/routes/ExamplesArgumentBuilder.js').ExamplesArgumentBuilder;
const EntitiesRepository = require(SOURCE_ROOT + '/model/entity/EntitiesRepository.js').EntitiesRepository;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const co = require('co');
const styleguide = require(FIXTURES_ROOT + '/Styleguide/styleguide.js');

/**
 * Spec
 */
xdescribe(ExamplesArgumentBuilder.className, function()
{
    beforeEach(function()
    {
        fixtures = styleguide.createFixture();
        fixtures.cliLogger = new CliLogger('', { muted: true });
    });

    describe('#buildCombinations', function()
    {
        it('should return a list of all combinations of relevant parameters (Enumerations)', function()
        {
            const promise = co(function *()
            {
                const entityId = '/default/elements/e001-link';
                const expected =
                [
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "internal",
                                "label": "Internal link (Default)"
                            }
                        },
                        {
                            "name": "skin",
                            "value": {
                                "value": "dark",
                                "label": "Dark (Default)"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "internal",
                                "label": "Internal link (Default)"
                            }
                        },
                        {
                            "name": "skin",
                            "value": {
                                "value": "light",
                                "label": "Light"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "external",
                                "label": "External link"
                            }
                        },
                        {
                            "name": "skin",
                            "value": {
                                "value": "dark",
                                "label": "Dark (Default)"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "external",
                                "label": "External link"
                            }
                        },
                        {
                            "name": "skin",
                            "value": {
                                "value": "light",
                                "label": "Light"
                            }
                        }
                    ]
                ];

                const entitiesRepository = fixtures.context.di.create(EntitiesRepository);
                const entity = yield entitiesRepository.getById(entityId);
                const testee = new ExamplesArgumentBuilder(fixtures.cliLogger);
                const combinations = yield testee.buildCombinations(entity);
                //console.log(JSON.stringify(combinations, null, 4));
                expect(combinations).to.be.deep.equal(expected);
                return;
            });
            return promise;
        });

        it('should allow to add custom parameters via meta data', function()
        {
            const promise = co(function *()
            {
                const entityId = '/default/elements/e002-button';
                const expected =
                [
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "internal",
                                "label": "Internal link (Default)"
                            }
                        },
                        {
                            "name": "disabled",
                            "value": {
                                "value": false,
                                "label": "Enabled"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "internal",
                                "label": "Internal link (Default)"
                            }
                        },
                        {
                            "name": "disabled",
                            "value": {
                                "value": true,
                                "label": "Disabled"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "external",
                                "label": "External link"
                            }
                        },
                        {
                            "name": "disabled",
                            "value": {
                                "value": false,
                                "label": "Enabled"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "external",
                                "label": "External link"
                            }
                        },
                        {
                            "name": "disabled",
                            "value": {
                                "value": true,
                                "label": "Disabled"
                            }
                        }
                    ]
                ];

                const entitiesRepository = fixtures.context.di.create(EntitiesRepository);
                const entity = yield entitiesRepository.getById(entityId);
                const testee = new ExamplesArgumentBuilder(fixtures.cliLogger);
                const combinations = yield testee.buildCombinations(entity);
                //console.log(JSON.stringify(combinations, null, 4));
                expect(combinations).to.be.deep.equal(expected);
                return;
            });
            return promise;
        });

        it('should allow to reorder parameters via meta data', function()
        {
            const promise = co(function *()
            {
                const entityId = '/default/elements/e003-cta';
                const expected =
                [
                   [
                        {
                            "name": "type",
                            "value": {
                                "value": "primary",
                                "label": "Primary (Default)"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/icon",
                                "label": "With Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "m",
                                "label": "Medium (Default)"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "primary",
                                "label": "Primary (Default)"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/icon",
                                "label": "With Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "s",
                                "label": "Small"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "primary",
                                "label": "Primary (Default)"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/no-icon",
                                "label": "Without Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "m",
                                "label": "Medium (Default)"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "primary",
                                "label": "Primary (Default)"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/no-icon",
                                "label": "Without Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "s",
                                "label": "Small"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "secondary",
                                "label": "Secondary"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/icon",
                                "label": "With Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "m",
                                "label": "Medium (Default)"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "secondary",
                                "label": "Secondary"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/icon",
                                "label": "With Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "s",
                                "label": "Small"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "secondary",
                                "label": "Secondary"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/no-icon",
                                "label": "Without Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "m",
                                "label": "Medium (Default)"
                            }
                        }
                    ],
                    [
                        {
                            "name": "type",
                            "value": {
                                "value": "secondary",
                                "label": "Secondary"
                            }
                        },
                        {
                            "name": "model",
                            "value": {
                                "value": "e-cta/no-icon",
                                "label": "Without Icon"
                            }
                        },
                        {
                            "name": "size",
                            "value": {
                                "value": "s",
                                "label": "Small"
                            }
                        }
                    ]
                ];

                const entitiesRepository = fixtures.context.di.create(EntitiesRepository);
                const entity = yield entitiesRepository.getById(entityId);
                const testee = new ExamplesArgumentBuilder(fixtures.cliLogger);
                const combinations = yield testee.buildCombinations(entity);
                //console.log(JSON.stringify(combinations, null, 4));
                expect(combinations).to.be.deep.equal(expected);
                return;
            });
            return promise;
        });
    });

    describe('#buildTree', function()
    {
        it('should generate a tree based off all combinations', function()
        {
            const promise = co(function *()
            {
                const entityId = '/default/elements/e001-link';
                const expected =
                {
                    "label": "e001-link",
                    "type": "root",
                    "children": [
                        {
                            "label": "Internal link (Default) [type]",
                            "type": "examples",
                            "children": [
                                {
                                    "label": "Dark (Default) [skin]",
                                    "type": "example",
                                    "children": [
                                        [
                                            {
                                                "name": "type",
                                                "value": "internal"
                                            },
                                            {
                                                "name": "skin",
                                                "value": "dark"
                                            }
                                        ]
                                    ]
                                },
                                {
                                    "label": "Light [skin]",
                                    "type": "example",
                                    "children": [
                                        [
                                            {
                                                "name": "type",
                                                "value": "internal"
                                            },
                                            {
                                                "name": "skin",
                                                "value": "light"
                                            }
                                        ]
                                    ]
                                }
                            ]
                        },
                        {
                            "label": "External link [type]",
                            "type": "examples",
                            "children": [
                                {
                                    "label": "Dark (Default) [skin]",
                                    "type": "example",
                                    "children": [
                                        [
                                            {
                                                "name": "type",
                                                "value": "external"
                                            },
                                            {
                                                "name": "skin",
                                                "value": "dark"
                                            }
                                        ]
                                    ]
                                },
                                {
                                    "label": "Light [skin]",
                                    "type": "example",
                                    "children": [
                                        [
                                            {
                                                "name": "type",
                                                "value": "external"
                                            },
                                            {
                                                "name": "skin",
                                                "value": "light"
                                            }
                                        ]
                                    ]
                                }
                            ]
                        }
                    ]
                };

                const entitiesRepository = fixtures.context.di.create(EntitiesRepository);
                const entity = yield entitiesRepository.getById(entityId);
                const testee = new ExamplesArgumentBuilder(fixtures.cliLogger);
                const tree = yield testee.buildTree(entity);
                //console.log(JSON.stringify(tree, null, 4));
                expect(tree).to.be.deep.equal(expected);
                return;
            });
            return promise;
        });
    });

    describe('#buildTemplate', function()
    {
        it('should generate a jinja template', function()
        {
            const promise = co(function *()
            {
                const entityId = '/default/elements/e001-link';
                const expected = `{% call examples(label='Internal link (Default) [type]', level=0) %}
    {% call example(label='Dark (Default) [skin]', level=2) %}
        {{ e001_link(type='internal', skin='dark') }}
    {% endcall %}
    {% call example(label='Light [skin]', level=2) %}
        {{ e001_link(type='internal', skin='light') }}
    {% endcall %}
{% endcall %}
{% call examples(label='External link [type]', level=0) %}
    {% call example(label='Dark (Default) [skin]', level=2) %}
        {{ e001_link(type='external', skin='dark') }}
    {% endcall %}
    {% call example(label='Light [skin]', level=2) %}
        {{ e001_link(type='external', skin='light') }}
    {% endcall %}
{% endcall %}
`;
                const entitiesRepository = fixtures.context.di.create(EntitiesRepository);
                const entity = yield entitiesRepository.getById(entityId);
                const testee = new ExamplesArgumentBuilder(fixtures.cliLogger);
                const source = yield testee.buildTemplate(entity);
                expect(source).to.be.equal(expected);
                return;
            });
            return promise;
        });
    });
});
