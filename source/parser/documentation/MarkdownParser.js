'use strict';

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');
const DocumentationText = require('../../model/documentation/DocumentationText.js').DocumentationText;
const DocumentationTextSection = require('../../model/documentation/DocumentationTextSection.js').DocumentationTextSection;
const marked = require('marked');


/**
 * A markdown to documentation parser
 */
class MarkdownParser extends Parser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super();

        // Add initial values
        const opts = options || {};
        this._sections = opts.sections || {};
        const defaultOptions =
        {
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
        };
        this._options = opts.options || defaultOptions;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/MarkdownParser';
    }


    /**
     * @param {string} content
     * @param {string} options
     * @returns {Promise<Object>}
     */
    parse(content, options)
    {
        if (!content || content.trim() === '')
        {
            Promise.resolve(false);
        }

        // Parse markdown
        const tokens = marked.lexer(content, this._config);

        // Create sections
        const sections = [];
        let section = false;
        for (const token of tokens)
        {
            if (token.type === 'heading' && token.depth === 1)
            {
                section = new DocumentationTextSection();
                section.contentType = ContentType.MARKDOWN;
                section.contentKind = ContentKind.TEXT;
                section.name = token.text.trim();

                for (const name in this._sections)
                {
                    const value = this._sections[name];
                    if (section.name.toLowerCase() == value.toLowerCase())
                    {
                        section.name = DocumentationTextSection[name];
                    }
                }

                sections.push(section);
            }
            else if (section)
            {
                section.tokens.push(token);
            }
        }
        const result = new DocumentationText();
        result.contentType = ContentType.MARKDOWN;
        result.contentKind = ContentKind.TEXT;
        result.sections = sections;
        result.tokens = tokens;

        return Promise.resolve(result);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.MarkdownParser = MarkdownParser;
