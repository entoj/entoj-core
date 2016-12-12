'use strict';


/**
 * Creates a list of media queries based on the given breakpoints
 *
 * @memberof processors
 */
function breakpointsToMediaQueries(breakpoints)
{
    const mediaQueries = {};
    for (const breakpointName in breakpoints)
    {
        const breakpoint = breakpoints[breakpointName];
        if (breakpoint.maxWidth)
        {
            mediaQueries[breakpointName + 'AndBelow'] = '(max-width: ' + breakpoint.maxWidth + ')';
        }
        if (breakpoint.minWidth)
        {
            mediaQueries[breakpointName + 'AndAbove'] = '(min-width: ' + breakpoint.minWidth + ')';
        }
        mediaQueries[breakpointName] = '';
        if (breakpoint.minWidth)
        {
            mediaQueries[breakpointName]+= '(min-width: ' + breakpoint.minWidth + ')';
        }
        if (breakpoint.maxWidth)
        {
            mediaQueries[breakpointName]+= (mediaQueries[breakpointName].length ? ' and ' : '') + '(max-width: ' + breakpoint.maxWidth + ')';
        }
    }
    return mediaQueries;
}


/**
 * Exports
 * @ignore
 */
module.exports.breakpointsToMediaQueries = breakpointsToMediaQueries;
