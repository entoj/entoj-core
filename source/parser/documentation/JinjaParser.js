'use strict';
/* eslint no-cond-assign:0 */

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;
const DocBlockParser = require('./DocBlockParser.js').DocBlockParser;
const DocumentationCallable = require('../../model/documentation/DocumentationCallable.js').DocumentationCallable;
const DocumentationParameter = require('../../model/documentation/DocumentationParameter.js').DocumentationParameter;
const ContentType = require('../../model/ContentType.js');
const ContentKind = require('../../model/ContentKind.js');
const trimMultiline = require('../../utils/string.js').trimMultiline;
const co = require('co');
const nunjucks = require('nunjucks');


/**
 * A jinja to documentation parser
 */
class JinjaParser extends Parser
{
    /**
     * @param {Object} options
     */
    constructor(options)
    {
        super(options);

        // Assign options
        this._parser = new DocBlockParser();
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/JinjaParser';
    }


    /**
     * @param {string} content
     * @returns {Promise<Array>}
     */
    tokenize(content)
    {
        const ast = nunjucks.lexer.lex(content);
        const result = [];
        let t;
        let token;
        while ((t = ast.nextToken()))
        {
            switch (t.type)
            {
                case 'comment':
                    token =
                    {
                        type: 'comment',
                        comment: t.value
                    };
                    result.push(token);
                    token = false;
                    break;

                case 'block-start':
                    token =
                    {
                        type: false,
                        name: false,
                        arguments: []
                    };
                    break;

                case 'block-end':
                    if (token && (token.type == 'include' || token.type == 'macro'))
                    {
                        result.push(token);
                    }
                    token = false;
                    break;

                case 'symbol':
                    if (token)
                    {
                        if (!token.type)
                        {
                            token.type = t.value;
                        }
                        else if (token.type == 'macro' && !token.name)
                        {
                            token.name = t.value;
                        }
                        else if (token.arguments)
                        {
                            token.arguments.push({ name: t.value, type: '*', value: undefined });
                        }
                    }
                    break;

                case 'int':
                case 'string':
                case 'boolean':
                    if (token.type == 'macro' && token.arguments.length)
                    {
                        let value = t.value;
                        if (t.type == 'string')
                        {
                            value = '\'' + value + '\'';
                        }
                        token.arguments[token.arguments.length - 1].type = t.type;
                        token.arguments[token.arguments.length - 1].value = value;
                    }
                    else if (token.type == 'include')
                    {
                        token.include = t.value;
                    }
                    break;

                default:
                    //console.log(token);
                    break;
            }
        }

        return Promise.resolve(result);
    }


    /**
     * @param {string} content
     * @param {string} options
     * @returns {Promise<Array>}
     */
    parse(content, options)
    {
        if (!content || content.trim() === '')
        {
            Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function*()
        {
            // Prepare
            const result = [];
            const contents = trimMultiline(content, [{ start: '{##', end: '#}' }]);
            const tokens = yield scope.tokenize(contents);

            // Parse
            let comment = false;
            for (const token of tokens)
            {
                switch (token.type)
                {
                    case 'comment':
                        comment = token.comment;
                        break;

                    case 'macro':
                        // Do we have a docblock?
                        let documentation;
                        if (comment)
                        {
                            documentation = yield scope._parser.parse(comment,
                                {
                                    hint: 'callable',
                                    contentType: ContentType.JINJA
                                });
                            comment = false;
                        }
                        else
                        {
                            documentation = new DocumentationCallable();
                        }

                        //console.log(documentation, token);
                        if (documentation instanceof DocumentationCallable)
                        {
                            documentation.contentType = ContentType.JINJA;
                            documentation.contentKind = ContentKind.MACRO;
                            documentation.name = token.name;

                            for (const argument of token.arguments)
                            {
                                let parameter = documentation.parameters.find(item => item.name === argument.name);
                                if (!parameter)
                                {
                                    parameter = new DocumentationParameter();
                                    parameter.name = argument.name;
                                    parameter.type = [DocBlockParser.mapType()];
                                    documentation.parameters.push(parameter);
                                }
                                if (argument.value && !parameter.defaultValue)
                                {
                                    parameter.defaultValue = argument.value;
                                }
                            }

                            result.push(documentation);
                        }
                        break;

                    case 'include':
                        // @todo add dependencies
                        comment = false;
                        break;

                    default:
                        comment = false;
                        break;
                }
            }

            return result;
        })
        .catch(function(error)
        {
            throw new Error('JinjaParser - ' + error);
        });

        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.JinjaParser = JinjaParser;
