'use strict';

/**
 * Requirements
 */
const HtmlFormatter = require(SOURCE_ROOT + '/formatter/html/HtmlFormatter.js').HtmlFormatter;
const glob = require('glob');
const fs = require('fs');


/**
 * Spec
 */
describe(HtmlFormatter.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });

    describe('#format()', function()
    {
        // Generate tests
        const rootPath = FIXTURES_ROOT + '/Formatter/Html/';
        const files = glob.sync('*.input.html', { cwd: rootPath });
        for (const file of files)
        {
            const basename = file.replace('.input.html', '');
            it('should conform to fixture ' + basename, function()
            {
                const input = fs.readFileSync(rootPath + file, { encoding: 'utf8' }).replace(/\r/g, '');
                const expected = fs.readFileSync(rootPath + basename + '.expected.html', { encoding: 'utf8' }).replace(/\r/g, '');
                const testee = new HtmlFormatter();
                const promise = testee.format(input).then(function(html)
                {
                    if (html !== expected)
                    {
                        console.log('---------------');
                        console.log('Result:');
                        console.log(html);
                        console.log('-----');
                        console.log('Expected:');
                        console.log(expected);
                    }
                    expect(html).to.be.equal(expected);
                });
                return promise;
            });
        }
    });
});
