'use strict';

const urlify = require('./urls.js').urlify;
const kebabCase = require('lodash.kebabcase');


/**
 * A simple number formating
 * @memberof utils
 */
Number.prototype.format = function(digits, decimals)
{
    const options = { minimumIntegerDigits: digits };
    if (decimals > 0)
    {
        options.minimumFractionDigits = decimals;
    }
    return this.toLocaleString('en-EN', options);
};


/**
 * Applies urlize to the string
 * @memberof utils
 */
String.prototype.urlify = function(whitespace)
{
    return urlify(this, whitespace);
};


/**
 * Replaces whitespace and dashes with lodashes
 * @memberof utils
 */
String.prototype.lodasherize = function()
{
    return this.replace(/\s|-/g, '_');
};


/**
 * Replaces uppercase letters with a dash
 * @memberof utils
 */
String.prototype.dasherize = function()
{
    return kebabCase(this);
};
