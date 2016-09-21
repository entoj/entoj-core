'use strict';

/**
 * @memberOf model
 */
class ContentKind
{
    /**
     *
     */
    static get UNKNOWN()
    {
        return '*';
    }

    /**
     *
     */
    static get CSS()
    {
        return 'css';
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
    static get MACRO()
    {
        return 'macro';
    }

    /**
     * @inheritDoc
     */
    static get EXAMPLE()
    {
        return 'example';
    }

    /**
     * @inheritDoc
     */
    static get TEXT()
    {
        return 'text';
    }
}

/**
 * Public
 * @ignore
 */
module.exports = ContentKind;