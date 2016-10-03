'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseFormatter = require('../BaseFormatter.js').BaseFormatter;
const htmlparser = require('htmlparser2');
const EOL = '\n';


/**
 * A basic html formatter
 */
class HtmlFormatter extends BaseFormatter
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        // Assign options
        this._indentation = '    ';
        this._currentTag = false;
        this._voidTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        this._inlineTags = ['a', 'span', 'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'small', 'em', 'b'];
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'formatter.html/HtmlFormatter';
    }


    /**
     * Returns true if all children of node are text nodes
     */
    hasOnlyTextNodes(node)
    {
        if (!node.children || !node.children.length)
        {
            return false;
        }
        let result = true;
        for (const child of node.children)
        {
            if (child.type != 'text')
            {
                result = false;
            }
        }
        return result;
    }


    /**
     *
     */
    attributesToString(attributes)
    {
        let result = '';
        const items = attributes || {};
        for (const key in items)
        {
            const name = key.toLowerCase();
            const value = items[key];
            result+= ' ' + name;
            if (value && value.trim() != '')
            {
                switch(name)
                {
                    case 'class':
                        result+= '="' + value.trim().replace(/\s+/, ' ') + '"';
                        break;

                    default:
                        result+= '="' + value.trim() + '"';
                }
            }
        }
        return result;
    }

    /**
     *
     */
    tagToString(node, level, isInline)
    {
        let result = '';

        // Opening tag
        result+= this._indentation.repeat(level) + '<' + node.name.toLowerCase();
        result+= this.attributesToString(node.attribs);
        result+= '>';

        // Newline if not inline
        if (!isInline)
        {
            result+= EOL;
        }

        // Child content tag if not void
        if (this._voidTags.indexOf(node.name.toLowerCase()) === -1)
        {
            result+= this.nodesToString(node.children || [], level + 1);
        }

        // Closing tag if not void
        if (this._voidTags.indexOf(node.name.toLowerCase()) === -1)
        {
            // Indent onyl if not inline
            if (!isInline)
            {
                result+= this._indentation.repeat(level);
            }
            result+= '</' + node.name.toLowerCase() + '>' + EOL;
        }

        return result;
    }

    /**
     *
     */
    nodesToString(nodes, level)
    {
        let result = '';
        for (const node of nodes)
        {
            switch(node.type)
            {
                case 'text':
                    if (this._currentTag === 'script')
                    {
                        if (node.data.trim() != '')
                        {
                            result+= this._indentation.repeat(level) + node.data.trim() + EOL;
                        }
                    }
                    else
                    {
                        if (node.data.trim() != '')
                        {
                            result+= node.data.trim() + ' ';
                        }
                    }
                    break;

                case 'directive':
                    result+= this._indentation.repeat(level) + '<' + node.data.toLowerCase() + '>' + EOL;
                    break;

                case 'tag':
                    this._currentTag = node.name.toLowerCase();
                    result+= this.tagToString(node, level, this.hasOnlyTextNodes(node) || (this._inlineTags.indexOf(node.name) > -1));
                    this._currentTag = false;
                    break;

                case 'script':
                    this._currentTag = 'script';
                    result+= this.tagToString(node, level, (node.children || []).length === 0);
                    this._currentTag = false;
                    break;

                case 'style':
                    this._currentTag = 'style';
                    result+= this.tagToString(node, level, (node.children || []).length === 0);
                    this._currentTag = false;
                    break;

                case 'comment':
                    result+= '<!--' + node.data + '-->';
                    break;

                /* istanbul ignore next */
                default:
                    this.logger.error('Unknown Type : ' + node.type);
            }
        }
        return result;
    }


    /**
     * @param {string} content
     * @param {string} options
     * @returns {Promise<Array>}
     */
    formatDom(dom)
    {
        return Promise.resolve(this.nodesToString(dom, 0).trim() + EOL);
    }


    /**
     * @param {string} content
     * @param {string} options
     * @returns {Promise<Array>}
     */
    format(content, options)
    {
        if (!content || content.trim() === '')
        {
            Promise.resolve('');
        }

        const scope = this;
        const promise = new Promise(function(resolve, reject)
        {
            const parser = new htmlparser.Parser(new htmlparser.DomHandler(function(error, dom)
            {
                /* istanbul ignore next */
                if (error)
                {
                    reject(error);
                    return;
                }

                scope.formatDom(dom)
                    .then(resolve);
            }));
            parser.write(content);
            parser.end();
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.HtmlFormatter = HtmlFormatter;
