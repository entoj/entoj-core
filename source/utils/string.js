'use strict';

/**
 * Trims a multiline string
 *
 * @memberOf utils
 * @param {String} content
 */
function trimMultiline(content, skipSections)
{
    if (!content || typeof content !== 'string')
    {
        return '';
    }
    const lines = content.replace(/\t/g, '    ').split('\n');
    let sectionStarted = false;
    const resultLines = lines.map(function(line)
    {
        let result = line.trim();
        if (!sectionStarted)
        {
            if (skipSections)
            {
                for (const skip of skipSections)
                {
                    if (skip.start == result)
                    {
                        sectionStarted = true;
                    }
                }
            }
        }
        else
        {
            for (const skip of skipSections)
            {
                if (skip.end == result)
                {
                    sectionStarted = false;
                }
            }
            if (sectionStarted)
            {
                result = line;
            }
        }
        return result;
    });
    return resultLines.join('\n');
}


/**
 * Shortens a string
 *
 * @memberOf utils
 * @param {String} content
 */
function shortenMiddle(content, length)
{
    if (!content || typeof content !== 'string')
    {
        return '';
    }
    let maxLength = length || 100;
    if (content.length < maxLength)
    {
        return content;
    }
    if (maxLength < 2)
    {
        return content.substr(0, maxLength);
    }

    maxLength-= 1;
    const remove = Math.max(0, (content.length - maxLength));
    const start = Math.round((content.length - remove) / 2);

    return content.substr(0, start) + '…' + content.substr(start + remove);
}


/**
 * Shortens a string
 *
 * @memberOf utils
 * @param {String} content
 */
function shortenLeft(content, length)
{
    if (!content || typeof content !== 'string')
    {
        return '';
    }
    const maxLength = length || 100;
    if (content.length < maxLength)
    {
        return content;
    }
    if (maxLength < 2)
    {
        return content.substr(-maxLength, maxLength);
    }
    return '…' + content.substr(-1 * (maxLength - 1), maxLength - 1);
}


/**
 * Uppercases the frist character of a string
 *
 * @memberOf utils
 * @param {String} content
 */
function uppercaseFirst (content)
{
    return content.charAt(0).toUpperCase() + content.substr(1);
}


/**
 * Exports
 * @ignore
 */
module.exports.trimMultiline = trimMultiline;
module.exports.shortenMiddle = shortenMiddle;
module.exports.shortenLeft = shortenLeft;
module.exports.uppercaseFirst = uppercaseFirst;
