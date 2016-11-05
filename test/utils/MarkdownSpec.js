"use strict";

/**
 * Requirements
 */
const fixWhitespace = require(SOURCE_ROOT + '/utils/markdown.js').fixWhitespace;

/**
 * Spec
 */
describe('utils/markdown', function()
{
    describe('#fixWhitespace', function()
    {
        it('should remove any superfluous whitespace', function()
        {
            const input = `
                # Headline
                ## Subheadline
                > Pardon my french
                *This text will be italic*
                **This text will be bold**
                1. Item 1
                  1. A corollary to the above item.
                  2. Yet another point to consider.
                2. Item 2
                  * A corollary that does not need to be ordered.
                    * This is indented four spaces, because it's two spaces further than the item above.
                    * You might want to consider making a new list.
                3. Item 3
                \`\`\`
                x = 0
                x = 2 + 2
                what is x
                \`\`\`
            `;
            const expected =
`# Headline
## Subheadline
> Pardon my french
*This text will be italic*
**This text will be bold**
1. Item 1
  1. A corollary to the above item.
  2. Yet another point to consider.
2. Item 2
  * A corollary that does not need to be ordered.
    * This is indented four spaces, because it's two spaces further than the item above.
    * You might want to consider making a new list.
3. Item 3
\`\`\`
x = 0
x = 2 + 2
what is x
\`\`\``;
            const testee = fixWhitespace(input);
            expect(testee).to.be.equal(expected);
        });
    });
});
