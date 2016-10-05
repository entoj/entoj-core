"use strict";

/**
 * Requirements
 */
const CallParser = require(SOURCE_ROOT + '/parser/jinja/CallParser.js').CallParser;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');


/**
 * Spec
 */
describe(CallParser.className, function()
{
    /**
     * Base Test
     */
    baseSpec(CallParser, 'parser.jinja/CallParser');

    /**
     * CallParser Test
     */
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#parse()', function()
    {
        it('should find simple macro calls', function()
        {
            const testee = new CallParser();
            const source = `{{ one() }}{{ two }}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.definitions).to.have.length(0);
                expect(macros.calls).to.have.length(1);
                expect(macros.calls).to.contain('one');
            });
            return promise;
        });

        it('should find yield macro calls', function()
        {
            const testee = new CallParser();
            const source = `{% call one() %}{% endcall) %}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.definitions).to.have.length(0);
                expect(macros.calls).to.have.length(1);
                expect(macros.calls).to.contain('one');
            });
            return promise;
        });

        it('should find all macro calls', function()
        {
            const testee = new CallParser();
            const source = `{% call one() %}{% endcall) %}{{ three() }}{% call two() %}{% endcall) %}{{ four() }}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.definitions).to.have.length(0);
                expect(macros.calls).to.have.length(4);
                expect(macros.calls).to.contain('one');
                expect(macros.calls).to.contain('two');
                expect(macros.calls).to.contain('three');
                expect(macros.calls).to.contain('four');
            });
            return promise;
        });

        it('should allow complex macro arguments', function()
        {
            const testee = new CallParser();
            const source = `{{ one(with:'Parameter') }}{{ two(model:{ value: key }) }}{{ three(with:'Parameter', more:'than') }}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.definitions).to.have.length(0);
                expect(macros.calls).to.have.length(3);
                expect(macros.calls).to.contain('one');
                expect(macros.calls).to.contain('two');
                expect(macros.calls).to.contain('three');
            });
            return promise;
        });

        it('should combine multiple macro calls', function()
        {
            const testee = new CallParser();
            const source = `{{ one() }}{{ one() }}{{ two() }}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.definitions).to.have.length(0);
                expect(macros.calls).to.have.length(2);
                expect(macros.calls).to.contain('one');
                expect(macros.calls).to.contain('two');
            });
            return promise;
        });

        it('should find macro definitions', function()
        {
            const testee = new CallParser();
            const source = `{% macro test() %}{% endmacro %}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.calls).to.have.length(0);
                expect(macros.definitions).to.have.length(1);
                expect(macros.definitions).to.contain('test');
            });
            return promise;
        });

        it('should calculate external calls', function()
        {
            const testee = new CallParser();
            const source = `{% macro test() %}{% endmacro %}{{ test() }}{{ external() }}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.calls).to.have.length(2);
                expect(macros.calls).to.contain('test');
                expect(macros.calls).to.contain('external');
                expect(macros.definitions).to.have.length(1);
                expect(macros.definitions).to.contain('test');
                expect(macros.externals).to.have.length(1);
                expect(macros.externals).to.contain('external');
            });
            return promise;
        });

        it('should ignore variables', function()
        {
            const testee = new CallParser();
            const source = `{{ foo }}`;
            const promise = testee.parse(source).then(function(macros)
            {
                expect(macros.calls).to.have.length(0);
            });
            return promise;
        });
    });
});
