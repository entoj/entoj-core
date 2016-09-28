'use strict';
/* eslint no-cond-assign:0 */

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;
const co = require('co');
const nunjucks = require('nunjucks');
const unique = require('lodash.uniq');
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
    parseYieldCall(ast)
    {
        let token = ast.nextToken();
        let result = false;
        let name = false;
        let callmacro = false;
        while(token)
        {
            //console.log('parseYieldCall', token);
            switch(token.type)
            {
                case nunjucks.lexer.TOKEN_SYMBOL:
                    if (token.value === 'call')
                    {
                        callmacro = true;
                    }
                    else
                    {
                        name = token.value;
                    }
                    break;

                case nunjucks.lexer.TOKEN_LEFT_PAREN:
                    if (callmacro && !result)
                    {
                        result = name;
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
            //console.log('parseSimpleCall', token);
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
        const result = [];
        let token;
        while ((token = ast.nextToken()))
        {
            //console.log('tokenize', token);
            switch (token.type)
            {
                case 'block-start':
                    const yieldCall = this.parseYieldCall(ast);
                    if (yieldCall)
                    {
                        result.push(yieldCall);
                    }
                    break;

                case 'variable-start':
                    const simpleCall = this.parseSimpleCall(ast);
                    if (simpleCall)
                    {
                        result.push(simpleCall);
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
            let result = yield scope.find(content);
            result = unique(result);
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
