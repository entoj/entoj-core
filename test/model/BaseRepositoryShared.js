"use strict";

/**
 * Requirements
 */
let BaseRepository = require(SOURCE_ROOT + '/model/BaseRepository.js').BaseRepository;
let BaseLoader = require(SOURCE_ROOT + '/model/BaseLoader.js').BaseLoader;
let BaseValueObject = require(SOURCE_ROOT + '/model/BaseValueObject.js').BaseValueObject;
let create = require(SOURCE_ROOT + '/utils/objects.js').create;
let co = require('co');
let sinon = require('sinon');
let baseSpec = require('../BaseShared.js').spec;



/**
 * Test Loader
 */
class TestLoader extends BaseLoader
{
    constructor(items, updates)
    {
        super(items);
        this._updates = updates || [];
    }

    load(items)
    {
        if (items)
        {
            return Promise.resolve(this._updates);
        }
        return Promise.resolve(this._items);
    }
}

/**
 * Test ValueObject
 */
class TestValueObject extends BaseValueObject
{
    constructor(id, name)
    {
        super();
        this.id = id;
        this.name = name;
    }

    get uniqueId()
    {
        return this.id;
    }

    update(data, clear)
    {
        let scope = this;
        let promise = co(function *()
        {
            yield BaseValueObject.prototype.update.apply(scope, [data, clear]);
            scope.name = data.name || '';
        });
        return promise;
    }
}


/**
 * Shared BaseRepository Spec
 */
function spec(type, className, prepareParameters)
{
    baseSpec(type, className, prepareParameters);


    let createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    beforeEach(function()
    {
        fixtures = {};
        fixtures.item1 = { name: 'One', number: 1 };
        fixtures.item2 = { name: 'Two', number: 2 };
        fixtures.item3 = { name: 'Three', number: 3, uniqueId: 'uid' };
        fixtures.item4 = { name: 'Four', number: 4, uniqueId: 'uid' };

        fixtures.addItems = function*(testee)
        {
            yield testee.add(fixtures.item1);
            yield testee.add(fixtures.item2);
        };
    });


    describe('#invalidate', function()
    {
        it('should load all items when called with no arguments', function()
        {
            let data =
            [
                {
                    name:'John'
                }
            ];
            let loader = new BaseLoader(data);
            sinon.spy(loader, 'load');
            let testee = createTestee(loader);
            let promise = co(function *()
            {
                yield testee.getItems();
                yield testee.invalidate();
                expect(loader.load.calledTwice).to.be.ok;
            });
            return promise;
        });

        it('should allow to update existing items', function()
        {
            let data =
            [
                new TestValueObject(1, 'Jim'),
                new TestValueObject(2, 'John')
            ];
            let load =
            [
                new TestValueObject(2, 'John Boy'),
            ];
            let loader = new TestLoader(data, load);
            let testee = createTestee(loader);
            let promise = co(function *()
            {
                yield testee.getItems();
                yield testee.invalidate({ add: [2] });
                let items = yield testee.getItems();
                expect(items).to.have.length(2);
                expect(items.find(item => item.uniqueId === 1).name).to.be.equal('Jim');
                expect(items.find(item => item.uniqueId === 2).name).to.be.equal('John Boy');
            });
            return promise;
        });

        it('should allow to add new items', function()
        {
            let data =
            [
                new TestValueObject(1, 'Jim')
            ];
            let load =
            [
                new TestValueObject(2, 'John')
            ];
            let loader = new TestLoader(data, load);
            let testee = createTestee(loader);
            let promise = co(function *()
            {
                yield testee.getItems();
                yield testee.invalidate({ add: [2] });
                let items = yield testee.getItems();
                expect(items).to.have.length(2);
                expect(items.find(item => item.uniqueId === 1).name).to.be.equal('Jim');
                expect(items.find(item => item.uniqueId === 2).name).to.be.equal('John');
            });
            return promise;
        });

        it('should allow to remove existing items', function()
        {
            let data =
            [
                new TestValueObject(1, 'Jim'),
                new TestValueObject(2, 'John')
            ];
            let load =
            [
            ];
            let loader = new TestLoader(data, load);
            let testee = createTestee(loader);
            let promise = co(function *()
            {
                yield testee.getItems();
                yield testee.invalidate({ remove: [2] });
                let items = yield testee.getItems();
                expect(items).to.have.length(1);
                expect(items.find(item => item.uniqueId === 1).name).to.be.equal('Jim');
            });
            return promise;
        });

        it('should resolve to an object describing all changes', function()
        {
            let vos =
            [
                new TestValueObject(1, 'Jim'),
                new TestValueObject(2, 'John'),
                new TestValueObject(3, 'Bob')
            ]
            let data =
            [
                vos[0],
                vos[1]
            ];
            let load =
            [
                new TestValueObject(2, 'John Boy'),
                vos[2]
            ];
            let expected =
            {
                'add':
                [
                    vos[2]
                ],
                'update':
                [
                    vos[1]
                ],
                'remove':
                [
                    vos[0]
                ]
            };
            let loader = new TestLoader(data, load);
            let testee = createTestee(loader);
            let promise = co(function *()
            {
                yield testee.getItems();
                let changes = yield testee.invalidate({ add: [2, 3], remove: [1] });
                expect(changes).to.be.deep.equal(expected);
            });
            return promise;
        });
    });


    describe('#add()', function()
    {
        it('should allow to add items', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield testee.add(fixtures.item1);
                yield testee.add(fixtures.item2, fixtures.item3);
                let items = yield testee.getItems();
                expect(items).to.have.members([fixtures.item1, fixtures.item2, fixtures.item3]);
           });
            return promise;
        });

        it('should dispatch signals.added after adding items', function(cb)
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                testee.signals.added.add(function(repository, items)
                {
                    expect(repository).to.be.equal(testee);
                    expect(items).to.have.length(1);
                    expect(items[0]).to.be.equal(fixtures.item1);
                    cb();
                });
                yield testee.add(fixtures.item1);
           });
        });
    });


    describe('#remove()', function()
    {
        it('should allow to remove items by instance', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield testee.add(fixtures.item1, fixtures.item2, fixtures.item3);
                yield testee.remove(fixtures.item1, fixtures.item3);
                let items = yield testee.getItems();
                expect(items).to.have.length(1);
                expect(items[0]).to.be.equal(fixtures.item2);
           });
            return promise;
        });

        it('should allow to remove items by uniqueId', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield testee.add(fixtures.item3, fixtures.item2);
                yield testee.remove(fixtures.item3.uniqueId);
                let items = yield testee.getItems();
                expect(items).to.have.length(1);
                expect(items[0]).to.be.equal(fixtures.item2);
           });
            return promise;
        });

        it('should remove all items that match', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield testee.add(fixtures.item1, fixtures.item2, fixtures.item1);
                yield testee.remove(fixtures.item1);
                let items = yield testee.getItems();
                expect(items).to.have.length(1);
                expect(items[0]).to.be.equal(fixtures.item2);
           });
            return promise;
        });

        it('should dispatch signals.removed after removing items', function(cb)
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                testee.signals.removed.add(function(repository, items)
                {
                    expect(repository).to.be.equal(testee);
                    expect(items).to.have.length(1);
                    expect(items[0]).to.be.equal(fixtures.item1);
                    cb();
                });
                yield testee.add(fixtures.item1, fixtures.item2);
                yield testee.remove(fixtures.item1);
           });
        });
    });


    describe('#replace()', function()
    {
        it('should allow to replace items by their uniqueIds', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield testee.add(fixtures.item1, fixtures.item2, fixtures.item3);
                yield testee.replace(fixtures.item4);
                let items = yield testee.getItems();
                expect(items).to.have.length(3);
                expect(items[0]).to.be.equal(fixtures.item1);
                expect(items[1]).to.be.equal(fixtures.item2);
                expect(items[2]).to.be.equal(fixtures.item4);
           });
            return promise;
        });

        it('should dispatch signals.replaced after replacing items', function(cb)
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                testee.signals.replaced.add(function(repository, items)
                {
                    expect(repository).to.be.equal(testee);
                    expect(items[0]).to.be.equal(fixtures.item4);
                    cb();
                });
                yield testee.add(fixtures.item1, fixtures.item2, fixtures.item3);
                yield testee.replace(fixtures.item4);
           });
        });
    });


    describe('#getItems', function()
    {
        it('should trigger a load on the configured loader', function()
        {
            let loader = new BaseLoader([{ name:'John' }]);
            sinon.spy(loader, 'load');
            let testee = createTestee(loader);
            let promise = co(function *()
            {
                yield testee.getItems(testee);
                expect(loader.load.calledOnce).to.be.ok;
                const items = yield testee.getPropertyList('name');
                expect(items).to.have.members(['John']);
            });
            return promise;
        });

        it('should trigger a load on the configured loader only once', function()
        {
            let loader = new BaseLoader([{ name:'John' }]);
            sinon.spy(loader, 'load');
            let testee = createTestee(loader);
            let promise = co(function *()
            {
                yield testee.getItems(testee);
                yield testee.getItems(testee);
                yield testee.getItems(testee);
                expect(loader.load.calledOnce).to.be.ok;
            });
            return promise;
        });
    });


    describe('#getPropertyList()', function()
    {
        it('should allow to get a list of item properties', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield fixtures.addItems(testee);
                const items = yield testee.getPropertyList('name');
                expect(items).to.have.members(['One', 'Two']);
            });
            return promise;
        });
    });


    describe('#findBy()', function()
    {
        it('should allow to find a item by a property value', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield fixtures.addItems(testee);
                const item = yield testee.findBy('name', 'One');
                expect(item).to.be.equal(fixtures.item1);
            });
            return promise;
        });

        it('should allow multiple properties', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield fixtures.addItems(testee);
                const item = yield testee.findBy(['name', 'number'], 2);
                expect(item).to.be.equal(fixtures.item2);
            });
            return promise;
        });

        it('should ignore case', function()
        {
            const testee = createTestee();
            const promise = co(function *()
            {
                yield* fixtures.addItems(testee);
                const item = yield testee.findBy('name', 'two');
                expect(item).to.be.equal(fixtures.item2);
            });
            return promise;
        });

        it('should resolve to undefined when item was not found', function()
        {
            const self = this;
            const testee = createTestee();
            const promise = co(function *()
            {
                yield* fixtures.addItems(testee);
                const item = yield testee.findBy('name', 'Foo');
                expect(item).to.be.not.ok;
            });
            return promise;
        });
    });
}

/**
 * Exports
 */
module.exports.spec = spec;
