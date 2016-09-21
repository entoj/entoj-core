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
    tokenizeMacro(ast)
    {
        let token = ast.nextToken();
        const result =
        {
            type: false,
            name: false
        };
        while(token)
        {
            switch(token.type)
            {
                case nunjucks.lexer.TOKEN_SYMBOL:
                    result.name = token.value;
                    break;

                case nunjucks.lexer.TOKEN_LEFT_PAREN:
                    result.type = 'macro';
                    token = false;
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
     * @param {string} content
     * @returns {Promise<Array>}
     */
    tokenize(content)
    {
        const ast = nunjucks.lexer.lex(content);
        const result = [];
        let token;
        while ((token = ast.nextToken()))
        {
            switch (token.type)
            {
                case 'block-start':
                    result.push(this.tokenizeMacro(ast));
                    break;

                case 'variable-start':
                    result.push(this.tokenizeMacro(ast));
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
            // Prepare
            let result = [];
            const tokens = yield scope.tokenize(content);

            // Parse
            for (const token of tokens)
            {
                switch (token.type)
                {
                    case 'macro':
                        result.push(token.name);
                        break;
                }
            }

            // Make unique
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
