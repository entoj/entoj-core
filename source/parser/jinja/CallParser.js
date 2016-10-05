'use strict';

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;
const co = require('co');
const nunjucks = require('nunjucks');
const unique = require('lodash.uniq');
const difference = require('lodash.difference');
require('../../utils/prototypes.js');


/**
 * A jinja macro calls parser
 */
class CallParser extends Parser
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.jinja/CallParser';
    }


    /**
     * @inheritDoc
     */
    parseCallOrMacro(ast)
    {
        let token = ast.nextToken();
        const result = {};
        let name = false;
        let call = false;
        let definition = false;
        while(token)
        {
            switch(token.type)
            {
                case nunjucks.lexer.TOKEN_SYMBOL:
                    if (token.value === 'call')
                    {
                        call = true;
                    }
                    else if (token.value === 'macro')
                    {
                        definition = true;
                    }
                    else
                    {
                        name = token.value;
                    }
                    break;

                case nunjucks.lexer.TOKEN_LEFT_PAREN:
                    if (call && !result.call)
                    {
                        result.call = name;
                    }
                    if (definition && !result.definition)
                    {
                        result.definition = name;
                    }
                    break;

                case nunjucks.lexer.TOKEN_BLOCK_END:
                    token = false;
                    break;
            }

            if (token !== false)
            {
                token = ast.nextToken();
            }
        }
        return result;
    }


    /**
     * @inheritDoc
     */
    parseSimpleCall(ast)
    {
        let token = ast.nextToken();
        let result = false;
        let name = false;
        while(token)
        {
            switch(token.type)
            {
                case nunjucks.lexer.TOKEN_SYMBOL:
                    name = token.value;
                    break;

                case nunjucks.lexer.TOKEN_LEFT_PAREN:
                    result = name;
                    break;

                case nunjucks.lexer.TOKEN_VARIABLE_END:
                    token = false;
                    break;
            }

            if (token !== false)
            {
                token = ast.nextToken();
            }
        }
        return result;
    }


    /**
     * @param {string} content
     * @returns {Promise<Array>}
     */
    find(content)
    {
        const ast = nunjucks.lexer.lex(content);
        const result =
        {
            calls: [],
            definitions: [],
            externals: []
        };
        let token;
        while ((token = ast.nextToken()))
        {
            switch (token.type)
            {
                case 'block-start':
                    const yieldCall = this.parseCallOrMacro(ast);
                    if (yieldCall.call)
                    {
                        result.calls.push(yieldCall.call);
                    }
                    if (yieldCall.definition)
                    {
                        result.definitions.push(yieldCall.definition);
                    }
                    break;

                case 'variable-start':
                    const simpleCall = this.parseSimpleCall(ast);
                    if (simpleCall)
                    {
                        result.calls.push(simpleCall);
                    }
                    break;

                default:
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
            const result = yield scope.find(content);
            result.calls = unique(result.calls);
            result.externals = difference(result.calls, result.definitions);
            return result;
        })
        .catch(function(error)
        {
            throw new Error('CallParser - ' + error);
        });

        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CallParser = CallParser;
