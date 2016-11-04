'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFilter = require('./BaseFilter.js').BaseFilter;
const DocumentationTextSection = require('../../model/documentation/DocumentationTextSection.js').DocumentationTextSection;
const marked = require('marked');


/**
 * @memberOf nunjucks.filter
 */
class MarkdownFilter extends BaseFilter
{
    /**
     * @inheritDoc
     */
    constructor()
    {
        super();
        this._name = 'markdown';
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.filter/MarkdownFilter';
    }


    /**
     * @inheritDoc
     */
    filter()
    {
        return function (value, headlineOffset)
        {
            if (!value)
            {
                return '';
            }

            let tokens = false;

            // Markdown
            if (typeof value == 'string')
            {
                tokens = marked.lexer(value);
            }

            // Array
            if (Array.isArray(value) && value.length > 0)
            {
                // Array of sections
                if (value[0] instanceof DocumentationTextSection)
                {
                    tokens = [];
                    const links = {};
                    for (const section of value)
                    {
                        tokens = tokens.concat(section.tokens);
                        for (const link in section.tokens.links)
                        {
                            links[link] = section.tokens.links[link];
                        }
                    }
                    tokens.links = links;
                }
                // Array of tokens
                else
                {
                    tokens = value;
                }
            }

            // Section
            if (value instanceof DocumentationTextSection)
            {
                tokens = value.getTokens();
                if (!tokens.links)
                {
                    tokens.links = {};
                }
            }

            // Render
            if (!tokens || !tokens.links)
            {
                return '';
            }

            // Prepare headline offset
            const options =
            {
            };
            if (headlineOffset && headlineOffset != 0)
            {
                options.renderer = new marked.Renderer();
                options.renderer.heading = function(text, level)
                {
                    const h = Math.min(5, Math.max(1, level + headlineOffset));
                    return '<h' + h + '>' + text + '</h' + h + '>';
                };
            }

            return marked.parser(tokens, options);
        };
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.MarkdownFilter = MarkdownFilter;
