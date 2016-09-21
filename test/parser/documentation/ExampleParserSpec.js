/**
 * Requirements
 */
const ExampleParser = require(SOURCE_ROOT + '/parser/documentation/ExampleParser.js').ExampleParser;
const DocumentationExample = require(SOURCE_ROOT + '/model/documentation/DocumentationExample.js').DocumentationExample;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');


/**
 * Spec
 */
describe(ExampleParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new ExampleParser();
            expect(testee.className).to.be.equal('parser.documentation/ExampleParser');
        });
    });


    describe('#parse()', function()
    {
        it('should always resolve to a DocumentationExample', function()
        {
            const testee = new ExampleParser();
            const docblock = ` `;

            const promise = testee.parse(docblock, { contentType: ContentType.JS }).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationExample);
            });
            return promise;
        });

        it('should support /** .. */ docblocks', function()
        {
            const testee = new ExampleParser();
            const docblock = `
            /**
              *  Example
              */
            {% macro one(name, id) %}`;

            const promise = testee.parse(docblock, { contentType: ContentType.JS }).then(function(documentation)
            {
                expect(documentation.description).to.contain('Example');
            });
            return promise;
        });

        it('should support {## .. #} docblocks', function()
        {
            const testee = new ExampleParser();
            const docblock = `
            {##
                Example
             #}
            {% macro one(name, id) %}`;

            const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation.description).to.contain('Example');
            });
            return promise;
        });

        it('should parse only the first docblock', function()
        {
            const testee = new ExampleParser();
            const docblock = `
            {##
                First
             #}
            {##
                Example
             #}
            {% macro one(name, id) %}`;

            const promise = testee.parse(docblock, { contentType: ContentType.JINJA }).then(function(documentation)
            {
                expect(documentation.description).to.contain('First');
            });
            return promise;
        });
    });
});
