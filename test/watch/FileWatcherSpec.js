"use strict";

/**
 * Requirements
 */
const FileWatcher = require(SOURCE_ROOT + '/watch/FileWatcher.js').FileWatcher;
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const baseSpec = require('../BaseShared.js').spec;
const compact = require(FIXTURES_ROOT + '/Watch/Compact.js');
const co = require('co');
const clone = require('lodash.clone');
const fs = require('fs');

/**
 * Spec
 */
describe(FileWatcher.className, function()
{
    baseSpec(FileWatcher, 'watch/FileWatcher', function(parameters)
    {
        parameters.unshift(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
        return parameters;
    });


    beforeEach(function()
    {
        fixtures = compact.createFixture();
        fixtures.cliLogger = new CliLogger('', { muted: true });
        fixtures.reset();
    });


    xdescribe('#processEvents', function()
    {
        it('should create site changes for pathes like /site or /site/file.ext', function()
        {
            let promise = co(function *()
            {
                let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
                let input =
                [
                    { name: 'add', path:'/foo' },
                    { name: 'add', path:'/baz/package.json' },
                    { name: 'remove', path:'/bar' }
                ];
                let expected =
                {
                    site:
                    {
                        add:
                        [
                            '/foo',
                            '/baz'
                        ],
                        remove:
                        [
                            '/bar'
                        ]
                    },
                    extensions:
                    [
                        '.json'
                    ],
                    files:
                    [
                        '/foo',
                        '/baz/package.json',
                        '/bar'
                    ],
                    sites:
                    [
                        'foo',
                        'baz',
                        'bar'
                    ]
                };
                let changes = yield testee.processEvents(input);
                expect(changes).to.be.deep.equal(expected);
            });
            return promise;
        });

        it('should create entity category changes for pathes like /site/modules that contain a valid EntityCategory', function()
        {
            let promise = co(function *()
            {
                let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
                let input =
                [
                    { name: 'add', path:'/foo/modules' },
                    { name: 'remove', path:'/bar/modules' },
                    { name: 'add', path:'/bar/bar' }
                ];
                let expected =
                {
                    entityCategory:
                    {
                        add:
                        [
                            '/foo/modules'
                        ],
                        remove:
                        [
                            '/bar/modules'
                        ]
                    },
                    extensions:
                    [
                    ],
                    files:
                    [
                        '/foo/modules',
                        '/bar/modules',
                        '/bar/bar'
                    ],
                    sites:
                    [
                        'foo',
                        'bar'
                    ]
                };
                let changes = yield testee.processEvents(input);
                expect(changes).to.be.deep.equal(expected);
            });
            return promise;
        });

        it('should create entity changes for pathes like /site/modules/m001-gallery or /site/modules/m001-gallery/js/m001-gallery.js that contain a valid EntityId', function()
        {
            let promise = co(function *()
            {
                let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
                let input =
                [
                    { name: 'add', path: '/foo/modules/m001-foo' },
                    { name: 'add', path: '/site/modules/m003-teaser/js/m002-teaser.js' },
                    { name: 'remove', path: '/bar/modules/m002-bar' },
                    { name: 'add', path: '/bar/bar/m001-foo' }
                ];
                let expected =
                {
                    entity:
                    {
                        add:
                        [
                            '/foo/modules/m001-foo',
                            '/site/modules/m003-teaser'
                        ],
                        remove:
                        [
                            '/bar/modules/m002-bar'
                        ]
                    },
                    extensions:
                    [
                        '.js'
                    ],
                    files:
                    [
                        '/foo/modules/m001-foo',
                        '/site/modules/m003-teaser/js/m002-teaser.js',
                        '/bar/modules/m002-bar',
                        '/bar/bar/m001-foo'
                    ],
                    sites:
                    [
                        'foo',
                        'site',
                        'bar'
                    ]
                };
                let changes = yield testee.processEvents(input);
                expect(changes).to.be.deep.equal(expected);
            });
            return promise;
        });

        it('should treat removal of files within entities as "add"', function()
        {
            let promise = co(function *()
            {
                let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
                let input =
                [
                    { name: 'remove', path: '/foo/package.json' },
                    { name: 'remove', path: '/foo/modules/package.json' },
                    { name: 'remove', path: '/foo/modules/m001-foo/package.json' }
                ];
                let expected =
                {
                    site:
                    {
                        add:
                        [
                            '/foo'
                        ]
                    },
                    entityCategory:
                    {
                        add:
                        [
                            '/foo/modules'
                        ]
                    },
                    entity:
                    {
                        add:
                        [
                            '/foo/modules/m001-foo'
                        ]
                    },
                    extensions:
                    [
                        '.json'
                    ],
                    files:
                    [
                        '/foo/package.json',
                        '/foo/modules/package.json',
                        '/foo/modules/m001-foo/package.json'
                    ],
                    sites:
                    [
                        'foo'
                    ]
                };
                let changes = yield testee.processEvents(input);
                expect(changes).to.be.deep.equal(expected);
            });
            return promise;
        });

        it('should remove a entity when all files are deleted', function()
        {
            let promise = co(function *()
            {
                let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
                let input =
                [
                    { name: 'remove', path: '/foo/modules/m001-foo/package.json' },
                    { name: 'remove', path: '/foo/modules/m001-foo' }
                ];
                let expected =
                {
                    entity:
                    {
                        remove:
                        [
                            '/foo/modules/m001-foo'
                        ]
                    },
                    extensions:
                    [
                        '.json'
                    ],
                    files:
                    [
                        '/foo/modules/m001-foo/package.json',
                        '/foo/modules/m001-foo'
                    ],
                    sites:
                    [
                        'foo'
                    ]
                };
                let changes = yield testee.processEvents(input);
                expect(changes).to.be.deep.equal(expected);
            });
            return promise;
        });

        it('should remove duplicate changes', function()
        {
            let promise = co(function *()
            {
                let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
                let input =
                [
                    { name: 'add', path: '/foo/modules/m001-foo/package.json' },
                    { name: 'add', path: '/foo/modules/m001-foo/m001-foo.md' }
                ];
                let expected =
                {
                    entity:
                    {
                        add:
                        [
                            '/foo/modules/m001-foo'
                        ]
                    },
                    extensions:
                    [
                        '.json',
                        '.md'
                    ],
                    files:
                    [
                        '/foo/modules/m001-foo/package.json',
                        '/foo/modules/m001-foo/m001-foo.md'
                    ],
                    sites:
                    [
                        'foo'
                    ]
                };
                let changes = yield testee.processEvents(input);
                expect(changes).to.be.deep.equal(expected);
            });
            return promise;
        });

        it('should recognize changes in global entities', function()
        {
            const promise = co(function *()
            {
                const testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
                const input =
                [
                    { name: 'change', path: '/foo/common/macros/helpers.j2' }
                ];
                const expected =
                {
                    entity:
                    {
                        add:
                        [
                            '/foo/common'
                        ]
                    },
                    extensions:
                    [
                        '.j2'
                    ],
                    files:
                    [
                        '/foo/common/macros/helpers.j2'
                    ],
                    sites:
                    [
                        'foo'
                    ]
                };
                const changes = yield testee.processEvents(input);
                expect(changes).to.be.deep.equal(expected);
                return true;
            });
            return promise;
        });

        it('should dispatch signals.changed', function(cb)
        {
            let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser);
            let data =
            [
                { name: 'add', path:'/foo/modules/m001-foo/js/m001-foo.js' }
            ];
            testee.signals.changed.add(function(watcher, changes)
            {
                expect(changes).to.be.ok;
                cb();
            });
            testee.processEvents(data);
        });
    });


    xdescribe('#addEvent', function()
    {
        it('should bundle events for #processEvents', function(cb)
        {
            let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser, { debounce: 50 });
            testee.signals.changed.add(function(watcher, changes)
            {
                expect(changes).to.be.ok;
                cb();
            });
            testee.addEvent('addDir', 'foo');
            testee.addEvent('addDir', 'foo/modules');
            testee.addEvent('addDir', 'foo/modules/m001-foo');
            testee.addEvent('add', 'foo/modules/m001-foo/m001-foo.j2');
            testee.addEvent('add', 'foo/modules/x001-foo/m001-foo.j2');
        });
    });


    // This test segfaults?
    describe('#start', function()
    {
        it('should watch files starting at the sites root', function(cb)
        {
            this.timeout(5000);
            let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser, { debounce: 50 });
            let expected =
            {
                entityCategory:
                {
                    add:
                    [
                        '/default/modules'
                    ]
                },
                entity:
                {
                    add:
                    [
                        '/default/modules/m001-gallery'
                    ]
                },
                files:
                [
                    '/default/modules',
                    '/default/modules/m001-gallery',
                    '/default/modules/m001-gallery/examples',
                    '/default/modules/m001-gallery/examples/default.j2',
                    '/default/modules/m001-gallery/examples/hero.j2',
                    '/default/modules/m001-gallery/image',
                    '/default/modules/m001-gallery/image/south-park1.jpg',
                    '/default/modules/m001-gallery/js',
                    '/default/modules/m001-gallery/js/m001-gallery-helper.js',
                    '/default/modules/m001-gallery/js/m001-gallery.js',
                    '/default/modules/m001-gallery/m001-gallery.j2',
                    '/default/modules/m001-gallery/m001-gallery.md',
                    '/default/modules/m001-gallery/macros',
                    '/default/modules/m001-gallery/macros/helper.j2',
                    '/default/modules/m001-gallery/model',
                    '/default/modules/m001-gallery/model/default.json',
                    '/default/modules/m001-gallery/package.json',
                    '/default/modules/m001-gallery/sass',
                    '/default/modules/m001-gallery/sass/m001-gallery.scss'
                ],
                extensions:
                [
                    '.j2',
                    '.jpg',
                    '.js',
                    '.md',
                    '.json',
                    '.scss'
                ],
                sites:
                [
                    'default'
                ]
            };
            testee.signals.changed.add(function(watcher, changes)
            {
                testee.stop();
                expect(changes).to.be.ok;
                expect(changes).to.be.deep.equal(expected);
                cb();
            });
            testee.start().then(function()
            {
                fixtures.copy('/default/modules/m001-gallery');
            })
        });


        it('kaboom', function(cb)
        {
            this.timeout(5000);
            let testee = new FileWatcher(fixtures.cliLogger, fixtures.pathes, fixtures.categoriesRepository, fixtures.entityIdParser, { debounce: 50 });
            testee.signals.changed.add(function(watcher, changes)
            {
                console.log(changes);
                testee.stop();
                cb();
            });

            fixtures.mkdir('/default/modules/m002-test');
            testee.start().then(function()
            {
                fixtures.rename('/default/modules/m002-test', '/default/modules/m002-gallery');
            })
        });
    });
});
