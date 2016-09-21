"use strict";

/**
 * Requirements
 */
let DebugFilter = require(SOURCE_ROOT + '/nunjucks/filter/DebugFilter.js').DebugFilter;
let nunjucks = require('nunjucks');


/**
 * Spec
 */
describe(DebugFilter.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
        fixtures.environment = new nunjucks.Environment();
        fixtures.filter = new DebugFilter(fixtures.environment);
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = fixtures.filter;
            expect(testee.className).to.be.equal('nunjucks.filter/DebugFilter');
        });
    });


    describe('{{ variable|debug }}', function()
    {
        it('should show a detailed dump of the given variable', function()
        {
            let data = { data: { foo: 'bar', baz: 10 }};
            let testee = fixtures.environment.renderString("{{ data|debug }}", data);
            expect(testee).to.contain('"foo": "bar"');
            expect(testee).to.contain('"baz": 10');
        });
    });
});