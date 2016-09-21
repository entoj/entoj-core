/**
 * Requirements
 */
const MarkdownParser = require(SOURCE_ROOT + '/parser/documentation/MarkdownParser.js').MarkdownParser;
const DocumentationText = require(SOURCE_ROOT + '/model/documentation/DocumentationText.js').DocumentationText;
const DocumentationTextSection = require(SOURCE_ROOT + '/model/documentation/DocumentationTextSection.js').DocumentationTextSection;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');


/**
 * Spec
 */
describe(MarkdownParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new MarkdownParser();
            expect(testee.className).to.be.equal('parser.documentation/MarkdownParser');
        });
    });


    describe('#parse()', function()
    {
        it('should resolve to a DocumentationText', function()
        {
            const testee = new MarkdownParser();
            const markdown = ` `;
            const promise = testee.parse(markdown).then(function(documentation)
            {
                expect(documentation).to.be.instanceof(DocumentationText);
            });
            return promise;
        });

        it('should treat every # headline as a section', function()
        {
            const testee = new MarkdownParser();
            const markdown = `
# Section1
Text1

# Section2
Text2`;
            const promise = testee.parse(markdown).then(function(documentation)
            {
                expect(documentation.sections).to.have.length(2);
                expect(documentation.sections[0]).to.be.instanceof(DocumentationTextSection);
                expect(documentation.sections[0].name).to.be.equal('Section1');
                expect(documentation.sections[0].tokens.length).to.be.above(0);
                expect(documentation.sections[1]).to.be.instanceof(DocumentationTextSection);
                expect(documentation.sections[1].name).to.be.equal('Section2');
                expect(documentation.sections[1].tokens.length).to.be.above(0);
            });
            return promise;
        });


        it('should allow to map headlines to section name', function()
        {
            const options =
            {
                sections:
                {
                    DESCRIPTION: 'Section1',
                    FUNCTIONAL: 'Section2'
                }
            };
            const testee = new MarkdownParser(options);
            const markdown = `
# Section1
Text1

# Section2
Text2`;
            const promise = testee.parse(markdown).then(function(documentation)
            {
                expect(documentation.sections).to.have.length(2);
                expect(documentation.sections[0]).to.be.instanceof(DocumentationTextSection);
                expect(documentation.sections[0].name).to.be.equal(DocumentationTextSection.DESCRIPTION);
                expect(documentation.sections[1]).to.be.instanceof(DocumentationTextSection);
                expect(documentation.sections[1].name).to.be.equal(DocumentationTextSection.FUNCTIONAL);
            });
            return promise;
        });

        it('should remove headline from mapped sections', function()
        {
            const options =
            {
                sections:
                {
                    DESCRIPTION: 'Section1'
                }
            };
            const testee = new MarkdownParser(options);
            const markdown = `
# Section1
Text1`;
            const promise = testee.parse(markdown).then(function(documentation)
            {
                expect(documentation.sections).to.have.length(1);
                expect(documentation.sections[0]).to.be.instanceof(DocumentationTextSection);
                expect(documentation.sections[0].tokens[0].type).to.be.equal('paragraph');
            });
            return promise;
        });
    });
});
