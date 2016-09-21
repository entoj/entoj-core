"use strict";

/**
 * Requirements
 */
const trimMultiline = require(SOURCE_ROOT + '/utils/string.js').trimMultiline;
const shortenMiddle = require(SOURCE_ROOT + '/utils/string.js').shortenMiddle;
const shortenLeft = require(SOURCE_ROOT + '/utils/string.js').shortenLeft;


/**
 * Spec
 */
describe('utils/String', function()
{
    describe('#trimMultiline', function()
    {
        it('should trim multiple lines', function()
        {
            const input =
`   # Headline
        ## Subheadline
> Pardon my french`;
            const expected =
`# Headline
## Subheadline
> Pardon my french`;
            const testee = trimMultiline(input);
            expect(testee).to.be.equal(expected);
        });

        it('should allow to exclude defined sections from triming', function()
        {
            const input =
`       # Safe?
    {##
        # Headline
        ## Subheadline
    #}
    > Pardon my french`;
            const expected =
`# Safe?
{##
        # Headline
        ## Subheadline
#}
> Pardon my french`;
            const testee = trimMultiline(input, [{ start: '{##', end: '#}' }]);
            expect(testee).to.be.equal(expected);
        });
    });

    describe('#shortenMiddle', function()
    {
        it('should leave string as is when < length', function()
        {
            const input = 'Lorem Ipsum Dolorem';
            const expected = 'Lorem Ipsum Dolorem';
            const testee = shortenMiddle(input);
            expect(testee).to.be.equal(expected);
        });

        it('should remove chars from the middle', function()
        {
            const input = '1234567890';
            const expected = '123…90';
            const testee = shortenMiddle(input, 6);
            expect(testee).to.be.equal(expected);
        });

        it('should drop last char when length = 2', function()
        {
            const input = '1234567890';
            const expected = '1…';
            const testee = shortenMiddle(input, 2);
            expect(testee).to.be.equal(expected);
        });

        it('should return first char when length = 1', function()
        {
            const input = '1234567890';
            const expected = '1';
            const testee = shortenMiddle(input, 1);
            expect(testee).to.be.equal(expected);
        });
    });


    describe('#shortenLeft', function()
    {
        it('should leave string as is when < length', function()
        {
            const input = 'Lorem Ipsum Dolorem';
            const expected = 'Lorem Ipsum Dolorem';
            const testee = shortenLeft(input);
            expect(testee).to.be.equal(expected);
        });

        it('should remove chars from the start', function()
        {
            const input = '1234567890';
            const expected = '…67890';
            const testee = shortenLeft(input, 6);
            expect(testee).to.be.equal(expected);
        });

        it('should drop last char when length = 2', function()
        {
            const input = '1234567890';
            const expected = '…0';
            const testee = shortenLeft(input, 2);
            expect(testee).to.be.equal(expected);
        });

        it('should return first char when length = 1', function()
        {
            const input = '1234567890';
            const expected = '0';
            const testee = shortenLeft(input, 1);
            expect(testee).to.be.equal(expected);
        });
    });
});
