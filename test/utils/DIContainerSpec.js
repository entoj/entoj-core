"use strict";

/**
 * Requirements
 */
const DIContainer = require(SOURCE_ROOT + '/utils/DIContainer.js').DIContainer;

/**
 * Spec
 */
describe(DIContainer.className, function()
{
    class Color
    {
        constructor(name)
        {
            this.name = name;
        }
    }

    class ShinyColor extends Color
    {
        constructor(name)
        {
            super(name);
        }
    }

    class Car
    {
        constructor(color, options)
        {
            this.color = color;
            this.options = options;
        }
    }


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new DIContainer();
            expect(testee.className).to.be.equal('utils/DIContainer');
        });
    });


    describe('#create & #map', function()
    {
        it('should return a instance of given type', function()
        {
            let testee = new DIContainer();
            expect(testee.create(Color)).to.be.instanceof(Color);
        });

        it('should return the value for given name', function()
        {
            let testee = new DIContainer();
            let color = new Color();
            testee.map('color', color);
            expect(testee.create('color')).to.be.equal(color);
        });

        it('should resolve name based dependencies', function()
        {
            let testee = new DIContainer();
            let color = new Color();
            testee.map('color', color);
            Car.injections = { 'parameters': ['color'] };
            expect(testee.create(Car).color).to.be.equal(color);
        });

        it('should resolve type based dependencies', function()
        {
            let testee = new DIContainer();
            Car.injections = { 'parameters': [Color] };
            expect(testee.create(Car).color).to.be.instanceof(Color);
        });

        it('should allow to remap types', function()
        {
            let testee = new DIContainer();
            testee.map(Color, ShinyColor);
            Car.injections = { 'parameters': [Color] };
            expect(testee.create(Car).color).to.be.instanceof(ShinyColor);
        });

        it('should use the injections of the remaped type', function()
        {
            let testee = new DIContainer();
            testee.map(Color, ShinyColor);
            testee.map('Color.name', 'red');
            testee.map('ShinyColor.name', 'green');

            Color.injections = { 'parameters': ['Color.name'] };
            ShinyColor.injections = { 'parameters': ['ShinyColor.name'] };
            Car.injections = { 'parameters': [Color] };

            let car = testee.create(Car);
            expect(car.color.name).to.be.equal('green');
        });

        it('should allow to map types as singletons', function()
        {
            let testee = new DIContainer();
            testee.map(Color, ShinyColor, true);
            Car.injections = { 'parameters': [Color] };
            expect(testee.create(Car).color).to.be.instanceof(ShinyColor);
            expect(testee.create(Car).color).to.be.equal(testee.create(Car).color);
        });

        it('should allow to map same type as singleton', function()
        {
            let testee = new DIContainer();
            testee.map(Color, Color, true);
            Car.injections = { 'parameters': [Color] };
            expect(testee.create(Car).color).to.be.instanceof(Color);
            expect(testee.create(Car).color).to.be.equal(testee.create(Car).color);
        });

        it('should allow to map types to a instance', function()
        {
            let testee = new DIContainer();
            let color = new ShinyColor();
            testee.map(Color, color);
            Car.injections = { 'parameters': [Color] };
            expect(testee.create(Car).color).to.be.equal(color);
            expect(testee.create(Car).color).to.be.equal(color);
        });

        it('should allow to override mappings', function()
        {
            let testee = new DIContainer();
            testee.map(Color, ShinyColor);
            let override = new Map();
            override.set('options', 'Test');
            Car.injections = { 'parameters': [Color, 'options'] };
            expect(testee.create(Car, override).color).to.be.instanceof(ShinyColor);
            expect(testee.create(Car, override).options).to.be.equal('Test');
        });
    });
});