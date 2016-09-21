'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const fs = require('fs');
const path = require('path');

/**
 * @memberOf nunjucks.tag
 */
class LoadTag extends Base
{
    /**
     * @param {string} basePath
     */
    constructor(basePath)
    {
        super();

        this._basePath = path.resolve(basePath || __dirname);
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'nunjucks.tag/LoadTag';
    }


    /**
     * @let {string}
     */
    get basePath()
    {
        return this._basePath;
    }


    /**
     * @let {array}
     */
    get tags()
    {
        return ['load'];
    }


    /**
     * @inheritDoc
     */
    toString()
    {
        return `[${this.className} ${this.basePath}`;
    }


    /**
     * @param {Object} parser
     * @param {Object} nodes
     * @param {Object} lexer
     */
    parse(parser, nodes, lexer)
    {
        const params = new nodes.Array();

        // get the tag token
        const tok = parser.nextToken();

        // get the json filename
        params.addChild(parser.parsePrimary());

        // into ?
        if (parser.peekToken().type !== lexer.TOKEN_BLOCK_END)
        {
            if (!parser.skipSymbol('into'))
            {
                parser.fail('You must specify into');
            }

            // get variable name
            params.addChild(parser.parsePrimary());
        }

        // end of block
        parser.advanceAfterBlockEnd(tok.value);

        // prepare params
        const nodeList = new nodes.NodeList();
        nodeList.addChild(params);

        // go
        return new nodes.CallExtension(this, 'run', nodeList, []);
    }


    /**
     * @param {Object} context
     * @param {Object} params
     */
    run(context, params)
    {
        const filename = path.resolve(this.basePath + params[0]);
        if (fs.existsSync(filename))
        {
            const data = JSON.parse(fs.readFileSync(filename, { encoding: 'utf8' }));
            if (params.length == 2)
            {
                context.ctx[params[1]] = data;
            }
            else
            {
                Object.assign(context.ctx, data);
            }
        }
        return '';
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.LoadTag = LoadTag;
