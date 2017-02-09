'use strict';

/**
 * @memberOf model
 */
class ContentType
{
    /**
     *
     */
    static get ANY()
    {
        return '*';
    }

    /**
     *
     */
    static get SASS()
    {
        return 'sass';
    }

    /**
     * @inheritDoc
     */
    static get JS()
    {
        return 'js';
    }

    /**
     * @inheritDoc
     */
    static get JSON()
    {
        return 'json';
    }

    /**
     * @inheritDoc
     */
    static get JINJA()
    {
        return 'jinja';
    }

    /**
     * @inheritDoc
     */
    static get MARKDOWN()
    {
        return 'markdown';
    }
}

/**
 * Public
 * @ignore
 */
module.exports = ContentType;
