'use strict';

/**
 * Requirements
 */
let HtmlFormatter = require(SOURCE_ROOT + '/formatter/html/HtmlFormatter.js').HtmlFormatter;
let glob = require('glob');
let fs = require('fs');


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
        let rootPath = FIXTURES_ROOT + '/Formatter/Html/';
        let files = glob.sync('*.input.html', { cwd: rootPath });
        for (let file of files)
        {
            let basename = file.replace('.input.html', '');
            it('should conform to fixture ' + basename, function()
            {
                let input = fs.readFileSync(rootPath + file, { encoding: 'utf8' });
                let expected = fs.readFileSync(rootPath + basename + '.expected.html', { encoding: 'utf8' });
                let testee = new HtmlFormatter();
                let promise = testee.format(input).then(function(html)
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
