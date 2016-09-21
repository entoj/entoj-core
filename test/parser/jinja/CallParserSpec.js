"use strict";

/**
 * Requirements
 */
const CallParser = require(SOURCE_ROOT + '/parser/jinja/CallParser.js').CallParser;

/**
 * Spec
 */
describe(CallParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new CallParser();
            expect(testee.className).to.be.equal('parser.jinja/CallParser');
        });
    });


    describe('#parse()', function()
    {
        it('should find all macro calls', function()
        {
            let testee = new CallParser();
            let source = `
            {% one() %}{% two() %}{% three() %}{{ four() }}`;
            let promise = testee.parse(source).then(function(macros)
            {
                expect(macros).to.have.length(4);
                expect(macros).to.contain('one');
                expect(macros).to.contain('two');
                expect(macros).to.contain('three');
                expect(macros).to.contain('four');
            });
            return promise;
        });

        it('should allow complex macro arguments', function()
        {
            let testee = new CallParser();
            let source = `
            {% one(with:'Parameter') %}{% two(model:{ value: key }) %}{% three(with:'Parameter', more:'than') %}`;
            let promise = testee.parse(source).then(function(macros)
            {
                expect(macros).to.have.length(3);
                expect(macros).to.contain('one');
                expect(macros).to.contain('two');
                expect(macros).to.contain('three');
            });
            return promise;
        });

        it('should ignore multiple macro calls', function()
        {
            let testee = new CallParser();
            let source = `
            {% one() %}{% one() %}{% two() %}`;
            let promise = testee.parse(source).then(function(macros)
            {
                expect(macros).to.have.length(2);
                expect(macros).to.contain('one');
                expect(macros).to.contain('two');
            });
            return promise;
        });
    });
});
