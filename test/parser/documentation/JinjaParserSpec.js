"use strict";

/**
 * Requirements
 */
let JinjaParser = require(SOURCE_ROOT + '/parser/documentation/JinjaParser.js').JinjaParser;
let DocumentationCallable = require(SOURCE_ROOT + '/model/documentation/DocumentationCallable.js').DocumentationCallable;
let DocumentationParameter = require(SOURCE_ROOT + '/model/documentation/DocumentationParameter.js').DocumentationParameter;
let ContentType = require(SOURCE_ROOT + '/model/ContentType.js');


/**
 * Spec
 */
describe(JinjaParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new JinjaParser();
            expect(testee.className).to.be.equal('parser.documentation/JinjaParser');
        });
    });


    describe('#parse()', function()
    {
        it('should parse macros without a valid docblock', function()
        {
            let testee = new JinjaParser();
            let docblock = `{% macro one(name='unnamed', id = 5) %}{% endmacro %}`;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
                let macro = documentation.find(doc => doc.name == 'one');
                expect(macro.parameters).to.have.length(2);
                expect(macro.parameters.find(param => param.name == 'name')).to.be.ok;
                expect(macro.parameters.find(param => param.name == 'name').defaultValue).to.be.equal("'unnamed'");
                expect(macro.parameters.find(param => param.name == 'id')).to.be.ok;
                expect(macro.parameters.find(param => param.name == 'id').defaultValue).to.be.equal("5");
            });
            return promise;
        });

        it('should parse macros with a valid docblock', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                @param {string} name
                @param {number} id
             #}
            {% macro one(name, id) %}{% endmacro %}`;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
                let macro = documentation.find(doc => doc.name == 'one');
                expect(macro.parameters).to.have.length(2);
                expect(macro.parameters.find(param => param.name == 'name')).to.be.ok;
                expect(macro.parameters.find(param => param.name == 'name').type).to.contain('String');
                expect(macro.parameters.find(param => param.name == 'id')).to.be.ok;
                expect(macro.parameters.find(param => param.name == 'id').type).to.contain('Number');
            });
            return promise;
        });

        it('should parse macros with mixed identation', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                @param {string} name
                @param {number} id
             #}
                {% macro one(name, id) %}{% endmacro %}
                    {##
                        @param {string} name
                     #}
        {% macro two(name) %}{% endmacro %}
                `;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(2);
                expect(documentation.find(doc => doc.name == 'one')).to.be.ok;
                expect(documentation.find(doc => doc.name == 'two')).to.be.ok;
            });
            return promise;
        });

        it('should enhance infos from docblock with macro infos', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                @param {string} name
                @param {number} id
             #}
            {% macro one(name, id = 1, class = 'one') %}{% endmacro %}`;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
                let macro = documentation.find(doc => doc.name == 'one');
                expect(macro.parameters).to.have.length(3);
                expect(macro.parameters.find(param => param.name == 'name')).to.be.ok;
                expect(macro.parameters.find(param => param.name == 'name').type).to.contain('String');
                expect(macro.parameters.find(param => param.name == 'id')).to.be.ok;
                expect(macro.parameters.find(param => param.name == 'id').type).to.contain('Number');
                expect(macro.parameters.find(param => param.name == 'id').defaultValue).to.be.equal('1');
                expect(macro.parameters.find(param => param.name == 'class')).to.be.ok;
                expect(macro.parameters.find(param => param.name == 'class').type).to.contain('*');
                expect(macro.parameters.find(param => param.name == 'class').defaultValue).to.be.equal("'one'");
            });
            return promise;
        });

        it('should allow to document maps/objects', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                @param {String} model.href
                @param {String} model.title
            #}
            {% macro e001_link(model) %}
            {%  endmacro %}
            `;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
                let macro = documentation.find(doc => doc.name == 'e001_link');
                expect(macro.parameters).to.have.length(1);
            });
            return promise;
        });

        it('should always parse macros as callables', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                Description
             #}
            {% macro one(name, id) %}{% endmacro %}`;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
                expect(documentation.find(doc => doc.name == 'one')).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });

        it('should allow markdown in the docblock', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                # Headline
                * List 1
                  * List 1.1
                * List 2
             #}
            {% macro one(name, id) %}{% endmacro %}`;
            let expected =
`# Headline
* List 1
  * List 1.1
* List 2`;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
                let macro = documentation.find(doc => doc.name == 'one');
                expect(macro.description).to.be.equal(expected);
            });
            return promise;
        });


        it('should allow comment within macro', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                @param {String} href - Link url
            #}
            {% macro e001_link(type, href, title, target, data, class) %}
                {# Render #}
                <a  href="{{ href }}"></a>
            {%  endmacro %}
            `;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
            });
            return promise;
        });
    });


    describe('performance', function()
    {
        it('should parse a macro within 20ms', function()
        {
            let testee = new JinjaParser();
            let docblock = `

            {##
                Add sanity checks for dumb queries like

                @param {String} name
                @param {String} mode
            #}
            {% macro one(name, id = 1, mode = 'one', ignore=false) %}{% endmacro %}
            `;

            this.timeout(20);
            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
            });
            return promise;
        });
    });


    describe('bugs', function()
    {
        it('should not get stuck when comment is in wrong place', function()
        {
            let testee = new JinjaParser();
            let docblock = `
            {##
                Add sanity checks for dumb queries like

                @param {String} name
                @param {String} mode
            #}
            {% include 'some/thing' %}
            {% macro one(name, id = 1, mode = 'one', ignore=false) %}{% endmacro %}
            `;

            let promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
            });
            return promise;
        });
    });
});
