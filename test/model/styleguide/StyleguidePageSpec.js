/**
 * Requirements
 */
const StyleguidePage = require(SOURCE_ROOT + '/model/styleguide/StyleguidePage.js').StyleguidePage;

/**
 * Spec
 */
describe(StyleguidePage.className, function()
{
    describe('#constructor()', function()
    {
        it('should allow to configure via a options object', function()
        {
            const testee = new StyleguidePage(
            {
                label: 'Label',
                path: 'path',
                template: 'index.j2'
            });
            expect(testee).to.have.property('label', 'Label');
            expect(testee).to.have.property('path', 'path');
            expect(testee).to.have.property('template', 'index.j2');
        });

        it('should be derived from label if not given', function()
        {
            const testee = new StyleguidePage(
            {
                label: 'Schriften und Farben'
            });
            expect(testee).to.have.property('path', 'schriften-und-farben');
        })

        it('should configure a tree of pages when given a tree configuration ', function()
        {
            const testee = new StyleguidePage(
            {
                label: 'Level1',
                children:
                [
                    {
                        label: 'Level1-1',
                        children:
                        [
                            {
                                label: 'Level1-1-1'
                            }
                        ]
                    },
                    {
                        label: 'Level1-2'
                    }
                ]
            });
            expect(testee).to.have.property('label', 'Level1');

            expect(testee.children[0]).to.have.property('label', 'Level1-1');
            expect(testee.children[0]).to.have.property('parent', testee);

            expect(testee.children[0].children[0]).to.have.property('label', 'Level1-1-1');
            expect(testee.children[0].children[0]).to.have.property('parent', testee.children[0]);

            expect(testee.children[1]).to.have.property('label', 'Level1-2');
            expect(testee.children[1]).to.have.property('parent', testee);
        });
    });


    describe('#path', function()
    {
        it('should be urlified', function()
        {
            const testee = new StyleguidePage(
            {
                path: 'Schriften und Farben'
            });
            expect(testee).to.have.property('path', 'schriften-und-farben');
        });
    });


    describe('#url', function()
    {
        it('should return a url based on all parent pages', function()
        {
            const testee = new StyleguidePage(
            {
                label: 'Level1',
                children:
                [
                    {
                        label: 'Level1-1',
                        children:
                        [
                            {
                                label: 'Level1-1-1'
                            }
                        ]
                    },
                    {
                        label: 'Level1-2'
                    }
                ]
            });
            expect(testee).to.have.property('url', '/');
            expect(testee.children[0]).to.have.property('url', '/level1-1');
            expect(testee.children[0].children[0]).to.have.property('url', '/level1-1/level1-1-1');
        });
    });


    describe('#className', function()
    {
        it('should return the namespaced class name', function()
        {
            const testee = new StyleguidePage();
            expect(testee.className).to.be.equal('model.styleguide/StyleguidePage');
        });
    });
});