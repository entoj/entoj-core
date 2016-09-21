'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const ContentType = require('../ContentType.js');
const ContentKind = require('../ContentKind.js');

/**
 * @memberOf model.documentation
 */
class DocumentationBase extends Base
{
    /**
     */
    constructor()
    {
        super();

        // Add initial values
        this._site = false;
        this._file = false;
        this._tags = [];
        this._group = '';
        this._contentType = ContentType.ANY;
        this._contentKind = ContentKind.UNKNOWN;
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.documentation/DocumentationBase';
    }


    /**
     * The site (aspect) this documentation belongs to.
     *
     * @property {model.site.Site}
     */
    get site()
    {
        return this._site;
    }

    set site(value)
    {
        this._site = value;
    }


    /**
     * The actual content type this documentation was extracted from.
     *
     * @see {model.ContentType}
     * @property {String}
     */
    get contentType()
    {
        return this._contentType;
    }

    set contentType(value)
    {
        this._contentType = value;
    }


    /**
     * The actual content kind this documentation was extracted from.
     *
     * @see {model.ContentKind}
     * @property {String}
     */
    get contentKind()
    {
        return this._contentKind;
    }

    set contentKind(value)
    {
        this._contentKind = value;
    }


    /**
     * @property {model.file.File}
     */
    get file()
    {
        return this._file;
    }

    set file(value)
    {
        this._file = value;
    }


    /**
     * @property {String}
     */
    get name()
    {
        return this._name;
    }

    set name(value)
    {
        this._name = value;
    }


    /**
     * @property {String}
     */
    get description()
    {
        return this._description;
    }

    set description(value)
    {
        this._description = value;
    }


    /**
     * @property {String}
     */
    get group()
    {
        return this._group;
    }

    set group(value)
    {
        this._group = value;
    }


    /**
     * @property {Array}
     */
    get tags()
    {
        return this._tags;
    }

    set tags(value)
    {
        this._tags = value;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocumentationBase = DocumentationBase;
