'use strict';

/**
 * Requirements
 */
let DocBlockParser = require(SOURCE_ROOT + '/parser/documentation/DocBlockParser.js').DocBlockParser;
let DocumentationCode = require(SOURCE_ROOT + '/model/documentation/DocumentationCode.js').DocumentationCode;
let DocumentationCallable = require(SOURCE_ROOT + '/model/documentation/DocumentationCallable.js').DocumentationCallable;
let DocumentationParameter = require(SOURCE_ROOT + '/model/documentation/DocumentationParameter.js').DocumentationParameter;
let DocumentationCompoundParameter = require(SOURCE_ROOT + '/model/documentation/DocumentationCompoundParameter.js').DocumentationCompoundParameter;
let DocumentationVariable = require(SOURCE_ROOT + '/model/documentation/DocumentationVariable.js').DocumentationVariable;
let DocumentationExample = require(SOURCE_ROOT + '/model/documentation/DocumentationExample.js').DocumentationExample;
let DocumentationClass = require(SOURCE_ROOT + '/model/documentation/DocumentationClass.js').DocumentationClass;
let ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
let marked = require('marked');


/**
 * Spec
 */
describe(DocBlockParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            let testee = new DocBlockParser();
            expect(testee.className).to.be.equal('parser.documentation/DocBlockParser');
        });
    });


    describe('#parse()', function()
    {
        it('should resolve to a DocumentationCode by default', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationCode);
            });
            return promise;
        });

        it('should allow to force a result type via the hint option', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA, hint: 'callable' }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });

        it('should allow markdown', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
                # Headline
                ## Subheadline
                > Pardon my french

                *This text will be italic*
                **This text will be bold**

                * Item1
                  * Item1.1
                * Item2

                \`\`\`
                x = 0
                x = 2 + 2
                what is x
                \`\`\`
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation.description).to.contain('# Headline');
                expect(documentation.description).to.contain('* Item1');
                expect(documentation.description).to.contain('  * Item1.1');
            });
            return promise;
        });

        it('should parse text, @name, @description, @namespace, @protected, @tags and @group tags per default', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
                Thats a freeform description
                @name Name
                @description
                Lorem Ipsum
                @namespace test
                @protected
                @tags one, two
                @group common
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationCode);
                expect(documentation.name).to.be.equal('Name');
                expect(documentation.description).to.contain('freeform description');
                expect(documentation.description).to.contain('Lorem Ipsum');
                expect(documentation.namespace).to.be.equal('test');
                expect(documentation.visibility).to.be.equal('protected');
                expect(documentation.tags).to.contain('one');
                expect(documentation.tags).to.contain('two');
                expect(documentation.group).to.be.equal('common');
            });
            return promise;
        });

        it('should have a default visibility of public', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation.visibility).to.be.equal('public');
            });
            return promise;
        });

        it('should ignore any docblock that contains @ignore', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
                @ignore
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation).to.be.not.ok;
            });
            return promise;
        });

        it('should resolve to a DocumentationCallable when finding a @param', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
                @param Name
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });

        it('should resolve to a DocumentationCallable when finding a @function', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            {#
                @function
            #}`;
            let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });

        it('should resolve to a DocumentationCallable when finding a @kind function', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @kind function
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.SASS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });

        it('should resolve to a DocumentationVariable when finding a @type', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @type
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.SASS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationVariable);
            });
            return promise;
        });

        it('should resolve to a DocumentationVariable when finding a @kind variable', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @kind variable
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.SASS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationVariable);
            });
            return promise;
        });

        it('should resolve to a DocumentationClass when finding a @class', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @class
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.JS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationClass);
            });
            return promise;
        });

        it('should resolve to a DocumentationClass when finding a @kind class', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @kind class
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.SASS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationClass);
            });
            return promise;
        });

        it('should resolve to a DocumentationExample when finding a empty @example', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @example
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.JS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationExample);
            });
            return promise;
        });

        it('should resolve to a DocumentationExample when finding a @kind example', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @kind example
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.SASS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationExample);
            });
            return promise;
        });

        describe('should parse @param tags', function()
        {
            it('should allow a param to have a name', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param Name
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param).to.be.instanceof(DocumentationParameter);
                });
                return promise;
            });

            it('should assume param to be mandatory', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param Name
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.isOptional).to.be.not.ok;
                });
                return promise;
            });

            it('should allow a param to be optional', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param [Name]
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.isOptional).to.be.ok;
                });
                return promise;
            });

            it('should allow a optional param to have a default value', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param [Name = Peter Parker]
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.defaultValue).to.be.equal('Peter Parker');
                });
                return promise;
            });

            it('should assume * as the default type', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param Name
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.type).to.contain('*');
                });
                return promise;
            });

            it('should allow a param to have a type', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param {Boolean} Name
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.type).to.have.length(1);
                    expect(param.type).to.contain('Boolean');
                });
                return promise;
            });

            it('should allow multiple types per param', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param {Boolean|String} Name
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.type).to.have.length(2);
                    expect(param.type).to.contain('Boolean');
                    expect(param.type).to.contain('String');
                });
                return promise;
            });

            it('should allow a param to have a description', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param {Boolean} Name - Description
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.description).to.be.equal('Description');
                });
                return promise;
            });

            it('should allow a param to have a multiline description', function()
            {
                const testee = new DocBlockParser();
                const docblock = `
                {#
                    @param {Boolean} Name - Line 1
                    Line 2
                #}`;
                const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                {
                    const param = documentation.parameters.find(param => param.name == 'Name');
                    expect(param.description).to.be.equal('Line 1\nLine 2');
                });
                return promise;
            });

            xit('should parse @param tags', function()
            {
                let testee = new DocBlockParser();
                let docblock = `
                {#
                    @param Name
                    @param Type - Description
                    @param {Boolean} Switch - Description
                    @param {bool|String} Mixed - Description
                    With a very long description
                    @param {Enumeration} Enumeration - Description
                        value1 - Lorem
                        value2
                    @param {Object} Map - Map Description
                    @param {bool|String} Map.x - X Description
                    @param {Number} Map.y - Y Description
                #}`;
                let promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
                    {
                        expect(documentation).to.be.instanceof(DocumentationCallable);

                        let param;
                        let enumeration;
                        let child;

                        param = documentation.parameters.find(param => param.name == 'Name');
                        expect(param).to.be.instanceof(DocumentationParameter);
                        expect(param.description).to.be.not.ok;
                        expect(param.type).to.contain('*');

                        param = documentation.parameters.find(param => param.name == 'Type');
                        expect(param).to.be.instanceof(DocumentationParameter);
                        expect(param.description).to.be.equal('Description');
                        expect(param.type).to.contain('*');

                        param = documentation.parameters.find(param => param.name == 'Switch');
                        expect(param).to.be.instanceof(DocumentationParameter);
                        expect(param.description).to.be.equal('Description');
                        expect(param.type).to.contain('Boolean');

                        param = documentation.parameters.find(param => param.name == 'Mixed');
                        expect(param).to.be.instanceof(DocumentationParameter);
                        expect(param.description).to.be.equal('Description\nWith a very long description');
                        expect(param.type).to.contain('Boolean');
                        expect(param.type).to.contain('String');

                        param = documentation.parameters.find(param => param.name == 'Enumeration');
                        expect(param).to.be.instanceof(DocumentationParameter);
                        expect(param.description).to.be.equal('Description');
                        expect(param.type).to.contain('Enumeration');
                        enumeration = param.enumeration.find(enumeration => enumeration.name == 'value1');
                        expect(enumeration.description).to.be.equal('Lorem');
                        enumeration = param.enumeration.find(enumeration => enumeration.name == 'value2');
                        expect(enumeration.description).to.be.not.ok;

                        param = documentation.parameters.find(param => param.name == 'Map');
                        expect(param).to.be.instanceof(DocumentationCompoundParameter);
                        expect(param.type).to.contain('Object');
                        expect(param.description).to.be.equal('Map Description');
                        child = param.children.find(child => child.name == 'x');
                        expect(child.description).to.be.equal('X Description');
                        expect(child.type).to.contain('Boolean');
                        expect(child.type).to.contain('String');
                        child = param.children.find(child => child.name == 'y');
                        expect(child.description).to.be.equal('Y Description');
                        expect(child.type).to.contain('Number');
                    });
                return promise;
            });
        });

        it('should parse @type', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * @type {bool|String}
             */`;
            let promise = testee.parse(docblock, { contentType: ContentType.SASS }).then(function(documentation)
                {
                    expect(documentation).to.be.instanceof(DocumentationVariable);
                    expect(documentation.type).to.contain('Boolean');
                    expect(documentation.type).to.contain('String');
                });
            return promise;
        });

        it('should parse a docblock within 20ms', function()
        {
            let testee = new DocBlockParser();
            let docblock = `
            /**
             * Add sanity checks for dumb queries like
             *
             * @param {String} $name
             * @param {String} $mode
             */
            `;

            this.timeout(50);
            let promise = testee.parse(docblock, { contentType: ContentType.SASS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationCallable);
            });
            return promise;
        });
    });
});
