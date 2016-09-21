/**
 * Requirements
 */
const JsParser = require(SOURCE_ROOT + '/parser/documentation/JsParser.js').JsParser;
const DocumentationCode = require(SOURCE_ROOT + '/model/documentation/DocumentationCode.js').DocumentationCode;
const DocumentationCallable = require(SOURCE_ROOT + '/model/documentation/DocumentationCallable.js').DocumentationCallable;
const DocumentationParameter = require(SOURCE_ROOT + '/model/documentation/DocumentationParameter.js').DocumentationParameter;
const DocumentationVariable = require(SOURCE_ROOT + '/model/documentation/DocumentationVariable.js').DocumentationVariable;
const DocumentationExample = require(SOURCE_ROOT + '/model/documentation/DocumentationExample.js').DocumentationExample;
const DocumentationClass = require(SOURCE_ROOT + '/model/documentation/DocumentationClass.js').DocumentationClass;
const ContentType = require(SOURCE_ROOT + '/model/ContentType.js');


/**
 * Spec
 */
describe(JsParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new JsParser();
            expect(testee.className).to.be.equal('parser.documentation/JsParser');
        });
    });
});
