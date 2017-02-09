/**
 * Requirements
 */
const DatamodelParser = require(SOURCE_ROOT + '/parser/documentation/DatamodelParser.js').DatamodelParser;
const DocumentationDatamodel = require(SOURCE_ROOT + '/model/documentation/DocumentationDatamodel.js').DocumentationDatamodel;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
const ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');


/**
 * Spec
 */
describe(DatamodelParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new DatamodelParser();
            expect(testee.className).to.be.equal('parser.documentation/DatamodelParser');
        });
    });

    describe('#parse()', function() {
        it('should always resolve to a DocumentationDatamodel', function () {
            const testee = new DatamodelParser();
            const docblock = ` `;

            const promise = testee.parse(docblock, {contentType: ContentType.JSON, hint: 'datamodel'}).then(function (documentation) {
                expect(documentation).to.be.instanceof(DocumentationDatamodel);
            });
            return promise;
        });
    });

});
