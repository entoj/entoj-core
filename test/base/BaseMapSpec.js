"use strict";

/**
 * Requirements
 */
const BaseMap = require(SOURCE_ROOT + '/base/BaseMap.js').BaseMap;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Spec
 */
describe(BaseMap.className, function()
{
    /**
     * Base Test
     */
    baseSpec(BaseMap, 'base/BaseMap');


    /**
     * BaseMap Test
     */
    describe('#constructor', function()
    {
        it('should allow to initilize map with a iterable', function()
        {
            const testee = new BaseMap({ foo: 'bar' });

            expect(testee.get('foo')).to.be.equal('bar');
        });
    });


    describe('#getByPath', function()
    {
        it('should return defaultValue when no path is given', function()
        {
            const testee = new BaseMap();

            expect(testee.getByPath(false, 'not found')).to.be.equal('not found');
        });

        it('should return defaultValue when path is not found', function()
        {
            const testee = new BaseMap();

            expect(testee.getByPath('simple', 'not found')).to.be.equal('not found');
        });

        it('should allow to get a value by path', function()
        {
            const testee = new BaseMap();
            testee.set('simple', 'simple');

            expect(testee.getByPath('simple')).to.be.equal('simple');
        });

        it('should support objects', function()
        {
            const testee = new BaseMap();
            testee.set('object', { path: { to: 'object' } });

            expect(testee.getByPath('object.path.to')).to.be.equal('object');
        });

        it('should support maps', function()
        {
            const testee = new BaseMap();
            const map1 = new Map();
            const map2 = new Map();
            map2.set('to', 'map');
            map1.set('path', map2);
            testee.set('map', map1);

            expect(testee.getByPath('map.path.to')).to.be.equal('map');
        });

        it('should return undefined when path is not found and no defaultValue given', function()
        {
            const testee = new BaseMap();
            testee.set('object', { path: { to: 'object' } });

            expect(testee.getByPath('object.path.from')).to.be.equal(undefined);
        });

        it('should return the defaultValue when path is not found', function()
        {
            const testee = new BaseMap();

            expect(testee.getByPath('object.path.to', 'Default')).to.be.equal('Default');
        });
    });


    describe('#load', function()
    {
        it('should allow to import a Map', function()
        {
            const testee = new BaseMap();
            const data = new Map();
            data.set('foo', 'bar');

            testee.load(data);
            expect(testee.get('foo')).to.be.equal('bar');
        });

        it('should allow to import a BaseMap', function()
        {
            const testee = new BaseMap();
            const data = new BaseMap();
            data.set('foo', 'bar');

            testee.load(data);
            expect(testee.get('foo')).to.be.equal('bar');
        });

        it('should allow to import a Object', function()
        {
            const testee = new BaseMap();
            const data =
            {
                foo: 'bar'
            };

            testee.load(data);
            expect(testee.get('foo')).to.be.equal('bar');
        });

        it('should preserve existing items', function()
        {
            const testee = new BaseMap();
            testee.set('bar', 'foo');
            const data =
            {
                foo: 'bar'
            };

            testee.load(data);
            expect(testee.get('foo')).to.be.equal('bar');
            expect(testee.get('bar')).to.be.equal('foo');
        });

        it('should allow to clear items before loading', function()
        {
            const testee = new BaseMap();
            testee.set('bar', 'foo');
            const data =
            {
                foo: 'bar'
            };

            testee.load(data, true);
            expect(testee.get('foo')).to.be.equal('bar');
            expect(testee.get('bar')).to.be.not.ok;
        });

        it('should do nothing when given non iterable data', function()
        {
            const testee = new BaseMap();

            testee.load(undefined);
            expect(testee.size).to.be.equal(0);
        });
    });


    describe('#merge', function()
    {
        it('should just swallow falsy values', function()
        {
            const testee = new BaseMap();
            testee.merge();
            testee.merge(null);
            testee.merge(false);
        });

        it('should allow to merge a Map', function()
        {
            const testee = new BaseMap();
            testee.set('foo', { value: 'bar', version: 1 });
            const data = new Map();
            data.set('foo', { version: 2 });

            testee.merge(data);
            expect(testee.getByPath('foo.value')).to.be.equal('bar');
            expect(testee.getByPath('foo.version')).to.be.equal(2);
        });

        it('should allow to merge a BaseMap', function()
        {
            const testee = new BaseMap();
            testee.set('foo', { value: 'bar', version: 1 });
            const data = new BaseMap();
            data.set('foo', { version: 2 });

            testee.merge(data);
            expect(testee.getByPath('foo.value')).to.be.equal('bar');
            expect(testee.getByPath('foo.version')).to.be.equal(2);
        });

        it('should allow to merge a Object', function()
        {
            const testee = new BaseMap();
            testee.set('foo', { value: 'bar', version: 1 });
            const data =
            {
                foo:
                {
                    version: 2
                }
            };

            testee.merge(data);
            expect(testee.getByPath('foo.value')).to.be.equal('bar');
            expect(testee.getByPath('foo.version')).to.be.equal(2);
        });
    });
});
