/**
 * Requirements
 */
const SassParser = require(SOURCE_ROOT + '/parser/documentation/SassParser.js').SassParser;
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
describe(SassParser.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new SassParser();
            expect(testee.className).to.be.equal('parser.documentation/SassParser');
        });
    });


    describe('#parse()', function()
    {
        it('should parse variables with a valid docblock', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @type {color}
             */
            $color-green: green;

            /**
             * @kind variable
             */
            $color-blue: rgba(0, 0, 255, 0.5) ;`;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(2);
                expect(documentation.find(doc => doc.name == '$color-green')).to.be.ok;
                //expect(documentation.find(doc => doc.name == '$color-green').value).to.be.equal('green');
                expect(documentation.find(doc => doc.name == '$color-blue')).to.be.ok;
                //expect(documentation.find(doc => doc.name == '$color-blue').value).to.be.equal('rgba(0, 0, 255, 0.5)');
            });
            return promise;
        });

        it('should ignore variables with @ignore', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @type {color}
             * @ignore
             */
            $color-green: green;`;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(0);
            });
            return promise;
        });


        it('should parse variables with mixed indentation', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @type {color}
             */
        $color-green:green;

                /**
                 * @kind variable
                 */
                    $color-blue: rgba(0, 0, 255, 0.5);`;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(2);
                expect(documentation.find(doc => doc.name == '$color-green')).to.be.ok;
                //expect(documentation.find(doc => doc.name == '$color-green').value).to.be.equal('green');
                expect(documentation.find(doc => doc.name == '$color-blue')).to.be.ok;
                //expect(documentation.find(doc => doc.name == '$color-blue').value).to.be.equal('rgba(0, 0, 255, 0.5)');
            });
            return promise;
        });

        it('should parse classes with a valid docblock', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @class
             */
            .color-green { color: green; }

            /**
             * @kind class
             */
            .color-blue,
            .it-is-blue
            {
                color: rgba(0, 0, 255, 0.5) ;
            }`;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(3);
                expect(documentation.find(doc => doc.name == '.color-green')).to.be.ok;
                expect(documentation.find(doc => doc.name == '.color-blue')).to.be.ok;
                expect(documentation.find(doc => doc.name == '.it-is-blue')).to.be.ok;
            });
            return promise;
        });

        it('should ignore classes with @ignore', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @class
             * @ignore
             */
            .color-green { color: green; }`;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(0);
            });
            return promise;
        });

        it('should parse classes with mixed indentation', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @class
             */
        .color-green { color: green }

            /**
             * @kind class
             */
                    .color-blue,
            .it-is-blue
            {
                color: rgba(0, 0, 255, 0.5);
            }`;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(3);
                expect(documentation.find(doc => doc.name == '.color-green')).to.be.ok;
                expect(documentation.find(doc => doc.name == '.color-blue')).to.be.ok;
                expect(documentation.find(doc => doc.name == '.it-is-blue')).to.be.ok;
            });
            return promise;
        });

        it('should parse mixins with a valid docblock', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @function
             */
            @mixin one-two()
            {
            }

            /**
             * @param {string} $name
             */
            @mixin two($name:'none')
            {
            }
            `;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(2);
                expect(documentation.find(doc => doc.name == 'one-two')).to.be.ok;
                expect(documentation.find(doc => doc.name == 'two')).to.be.ok;
                expect(documentation.find(doc => doc.name == 'two').parameters).to.have.length(1);
            });
            return promise;
        });

        it('should ignore mixins with @ignore', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @function
             * @ignore
             */
            @mixin one()
            {
            }`;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(0);
            });
            return promise;
        });

        it('should parse mixins with mixed indentation', function()
        {
            const testee = new SassParser();
            const docblock = `
            /**
             * @function
             */
                @mixin one()
            {
            }

                /**
                 * @param {string} $name
                 * @param {number} $id
                 */

        @mixin two(
            $name :'none',
            $id : 1)
            {
            }
            `;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(2);
                expect(documentation.find(doc => doc.name == 'one')).to.be.ok;
                expect(documentation.find(doc => doc.name == 'two')).to.be.ok;
                expect(documentation.find(doc => doc.name == 'two').parameters).to.have.length(2);
            });
            return promise;
        });

        it('should enhance infos from docblock with mixin infos', function()
        {
            const testee = new SassParser();
            const docblock = `

            /**
             * @kind function
             */
            @mixin three(
                $name: 'hey',
                $id: 1)
            {
            }
            `;

            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
                expect(documentation.find(doc => doc.name == 'three')).to.be.ok;
                expect(documentation.find(doc => doc.name == 'three').parameters).to.have.length(2);
                expect(documentation.find(doc => doc.name == 'three').parameters[0].name).to.be.equal('$name');
                //expect(documentation.find(doc => doc.name == 'three').parameters[0].defaultValue).to.be.equal("'hey'");
                expect(documentation.find(doc => doc.name == 'three').parameters[1].name).to.be.equal('$id');
                //expect(documentation.find(doc => doc.name == 'three').parameters[1].defaultValue).to.be.equal('1');
            });
            return promise;
        });
    });


    describe('performance', function()
    {
        it('should parse a macro within 20ms', function()
        {
            const testee = new SassParser();
            const docblock = `

            /**
             * Add sanity checks for dumb queries like
             *
             * @param {String} $name
             * @param {String} $mode
             */
            @mixin use-breakpoint($name: 'mobile', $mode: 'self')
            {
            }
            `;

            this.timeout(20);
            const promise = testee.parse(docblock).then(function(documentation)
            {
                expect(documentation).to.have.length(1);
            });
            return promise;
        });
    });
});
