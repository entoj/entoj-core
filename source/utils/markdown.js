'use strict';

/**
 * Fixes whitespace for proper markdown parsing.
 *
 * @memberof utils
 * @param {String} content
 */
function fixWhitespace(content)
{
    let result = '';
    const lines = content.replace(/\t/g, '    ').split('\n');

    // Find spaces that need to be removed
    let spaces = 999;
    for (const line of lines)
    {
        if (line.trim() != '')
        {
            const match = line.match(/^\s+/g);
            if (match)
            {
                spaces = Math.min(spaces, match[0].length);
            }
        }
    }

    // Create the regex for replcement
    const regex = new RegExp('^\\s{' + spaces + '}');

    // Remove spaces
    for (const line of lines)
    {
        const corrected = line.replace(regex, '');
        result+= corrected + '\n';
    }

    // Remove empty lines at start & end
    result = result.trim();

    return result;
}


/**
 * Exports
 * @ignore
 */
module.exports.fixWhitespace = fixWhitespace;
