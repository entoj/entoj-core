'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const urlify = require('../../utils/urls.js').urlify;


/**
 * @class
 * @memberOf entity
 * @extends {Base}
 */
class StyleguidePage extends Base
{
    /**
     * @param {object} options
     */
    constructor(options)
    {
        super();

        // Get opts
        const opts = options || {};
        this._label = opts.label ? opts.label : '';
        this._path = urlify(opts.path ? opts.path : this._label);
        this._template = opts.template ? opts.template : undefined;
        this._children = [];

        // Handle children
        if (Array.isArray(opts.children))
        {
            for(const child of opts.children)
            {
                this.create(child);
            }
        }
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.styleguide/StyleguidePage';
    }


    /**
     * @property {string}
     */
    get parent()
    {
        return this._parent;
    }

    /**
     * @param {StyleguidePage}
     */
    set parent(value)
    {
        this._parent = value;
    }


    /**
     * @property {string}
     */
    get label()
    {
        return this._label;
    }


    /**
     * @property {string}
     */
    get path()
    {
        return this._path;
    }


    /**
     * @property {string}
     */
    get url()
    {
        if (!this.parent)
        {
            return '/';
        }
        let result = this.parent.url;
        if (!result.endsWith('/'))
        {
            result+= '/';
        }
        result+= this.path;
        return result;
    }


    /**
     * @property {string}
     */
    get template()
    {
        return this._template;
    }


    /**
     * @property {Array}
     */
    get children()
    {
        return this._children;
    }


    /**
     * @param {StyleguidePage} page
     */
    add(page)
    {
        page.parent = this;
        this.children.push(page);
    }


    /**
     * @param {object|StyleguidePage} data
     * @return {StyleguidePage}
     */
    create(data)
    {
        let page;
        if (data instanceof StyleguidePage)
        {
            page = data;
        }
        else
        {
            page = new StyleguidePage(data);
        }
        this.add(page);
        return page;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.StyleguidePage = StyleguidePage;
