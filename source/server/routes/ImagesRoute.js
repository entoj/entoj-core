'use strict';

/**
 * Requirements
 * @ignore
 */
const BaseRoute = require('./BaseRoute.js').BaseRoute;
const ImageResizer = require('../../image/ImageResizer.js').ImageResizer;
const CliLogger = require('../../cli/CliLogger.js').CliLogger;
const assertParameter = require('../../utils/assert.js').assertParameter;


/**
 * @memberOf server.routes
 */
class ImagesRoute extends BaseRoute
{
    /**
     * @param {ImageResizer} [imageResizer]
     * @param {object} [options]
     */
    constructor(cliLogger, imageResizer, options)
    {
        super(cliLogger.createPrefixed('routes.imagesroute'));

        // Check params
        assertParameter(this, 'imageResizer', imageResizer, true, ImageResizer);

        // Assign options
        const opts = options || '';
        this._imageResizer = imageResizer;
        this._rootUrl = opts.rootUrl || '/images/:image/:width?/:height?/:forced?';
        this._staticFileExtensions = opts.staticFileExtensions || ['.png', '.jpg', '.gif', '.svg'];
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, ImageResizer, 'server.routes/ImagesRoute.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server.routes/ImagesRoute';
    }


    /**
     * @inheritDocs
     */
    handleImage(request, response, next)
    {
        const scope = this;
        const width = parseInt(request.params.width, 10) || 0;
        const height = parseInt(request.params.height, 10) || 0;
        const work = this._cliLogger.work('Serving image <' + request.params.image + '> as <' + width + '>x<' + height + '>');
        this._imageResizer.resize(request.params.image, width, height, request.params.forced).then(function (filename)
        {
            response.sendFile(filename);
            scope._cliLogger.end(work);
        });
    }


    /**
     * @param {Express}
     */
    register(express)
    {
        const work = this._cliLogger.work('Registering <' + this.className + '> as middleware');
        express.all(this._rootUrl, this.handleImage.bind(this));
        this._cliLogger.end(work);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImagesRoute = ImagesRoute;
