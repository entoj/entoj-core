'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const PathesConfiguration = require('../model/configuration/PathesConfiguration.js').PathesConfiguration;
const assertParameter = require('../utils/assert.js').assertParameter;
const co = require('co');
const glob = require('../utils/glob.js');
const fs = require('co-fs-extra');
const path = require('path');
const pathes = require('../utils/pathes.js');
const child_process = require('child_process');


/**
 *
 */
class ImageResizer extends Base
{
    /**
     * @param {Object} options
     */
    constructor(pathesConfiguration, options)
    {
        super(options);

        // Check params
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign
        const opts = options || {};
        this._pathesConfiguration = pathesConfiguration;
        this._showSize = (typeof opts.showSize !== 'undefined') ? opts.showSize : true;
        this._useCache = (typeof opts.useCache !== 'undefined') ? opts.useCache : true;
        this._resizableFileExtensions = opts.resizableFileExtensions || ['.png', '.jpg'];
        this._font = pathes.concat(__dirname, '/fonts/Dosis-Regular.ttf');
        this._cacheName = 'images';
        this._dataName = 'images';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, 'image/ImageResizer.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'image/ImageResizer';
    }


    /**
     * Gets the image size in pixel
     *
     * @param {string} filename
     * @returns {Promise<Object>}
     */
    getImageSize(filename)
    {
        const raw = child_process.spawnSync('gm', ['identify', '-format', '%wx%h', filename]);
        if (!raw.stdout)
        {
            this.logger.error('getImageSize - failed, is GraphicsMagic installed?');
            return Promise.resolve(false);
        }
        const split = raw.stdout.toString().trim().split('x');
        const result =
        {
            width: parseInt(split[0], 10),
            height: parseInt(split[1], 10)
        };
        return Promise.resolve(result);
    }


    /**
     * Reads the image settings when available
     *
     * @param {string} filename
     * @returns {Promise<Object>}
     */
    getImageSettings(filename)
    {
        const scope = this;
        const promise = co(function*()
        {
            const result = yield scope.getImageSize(filename);

            if (!result)
            {
                return result;
            }

            const settingsFile = filename.substr(0, filename.length - 3) + 'json';
            const settingsFileExists = yield fs.exists(settingsFile);
            if (settingsFileExists)
            {
                const settingsFileContent = yield fs.readFile(settingsFile, { encoding: 'utf8' });
                result.focal = JSON.parse(settingsFileContent).focal;
            }
            else
            {
                result.focal =
                {
                    x: 0,
                    y: 0,
                    width: result.width,
                    height: result.height
                };
            }

            return result;
        });
        return promise;
    }


    /**
     * Get source image
     *
     * @param {string} name
     * @returns {Promise<string>}
     */
    resolveImageFilename(name)
    {
        const scope = this;
        const promise = co(function*()
        {
            const basePath = yield scope._pathesConfiguration.resolveData('/' + scope._dataName);
            const files = yield glob(pathes.concat(basePath, name));
            if (!files || !files.length)
            {
                return false;
            }
            const index = Math.round(Math.random() * (files.length - 1));
            return files[index];
        });
        return promise;
    }


    /**
     * Get cached image
     *
     * @param {string} filename
     * @param {number} width
     * @param {number} height
     * @param {bool} forced
     * @returns {Promise<string>}
     */
    resolveCacheFilename(filename, width, height, forced)
    {
        const scope = this;
        const promise = co(function*()
        {
            const basePath = yield scope._pathesConfiguration.resolveCache('/' + scope._cacheName);
            return pathes.concat(basePath, (width || 0) + 'x' + (height || 0) + '-' + (forced || false) + '-' + path.basename(filename));
        });
        return promise;
    }


    /**
     * Calculates the area that will be resized honoring the focal point.
     *
     * @param {number} width
     * @param {number} height
     * @param {bool} forced
     * @param {Object} settings
     * @returns {Promise<Object>}
     */
    calculateArea(width, height, forced, settings)
    {
        const result =
        {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            aspect: 0
        };

        //Get maximum enclosing size
        if (width >= height)
        {
            result.aspect = height / width;

            if (settings.width >= settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height / result.aspect);
            }
            else
            {
                result.width = settings.width;
                result.height = Math.round(result.width * result.aspect);
            }

            if (result.height > settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height / result.aspect);
            }
            else if (result.width > settings.width)
            {
                result.width = settings.width;
                result.height = Math.round(result.width * result.aspect);
            }
        }
        else
        {
            result.aspect = width / height;

            if (settings.width >= settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height * result.aspect);
            }
            else
            {
                result.width = settings.width;
                result.height = Math.round(result.width / result.aspect);
            }

            if (result.height > settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height * result.aspect);
            }
            else if (result.width > settings.width)
            {
                result.width = settings.width;
                result.height = Math.round(result.width / result.aspect);
            }
        }

        //Get enclosing area
        if (forced == '1')
        {
            result.x = Math.round(settings.focal.x + ((settings.focal.width - result.width) / 2));
            result.y = Math.round(settings.focal.y + ((settings.focal.height - result.height) / 2));
            result.x = Math.max(0, Math.min(result.x, settings.width - result.width));
            result.y = Math.max(0, Math.min(result.y, settings.height - result.height));
        }
        if (forced == 'tl' || forced == 'max')
        {
            result.x = 0;
            result.y = 0;
        }
        if (forced == 'tr')
        {
            result.x = settings.width - result.width;
            result.y = 0;
        }
        if (forced == 'bl')
        {
            result.x = 0;
            result.y = settings.height - result.height;
        }
        if (forced == 'br')
        {
            result.x = settings.width - result.width;
            result.y = settings.height - result.height;
        }

        return Promise.resolve(result);
    }


    /**
     * [addLabel description]
     * @param {[type]} width         [description]
     * @param {[type]} height        [description]
     * @param {[type]} label         [description]
     */
    addLabel(options, width, height, label)
    {
        if (!this._showSize)
        {
            return;
        }

        // Font settings
        const fontSize = 12;
        const fontWidth = 5;
        const fontHeight = 10;
        const offsetX = 0;
        const offsetY = 0;
        const paddingX = 4;
        const paddingY = 4;
        const position = 'br';

        // Calculate position
        const textWidth = label.length * fontWidth;
        const textHeight = fontHeight;
        const rectangleWidth = Math.round(textWidth + paddingX * 2);
        const rectangleHeight = Math.round(textHeight + paddingY * 2);
        let x1 = 0;
        let y1 = 0;
        let x2 = 0;
        let y2 = 0;
        if (position == 'tl')
        {
            x1 = Math.round(offsetX);
            y1 = Math.round(offsetY);
            x2 = Math.round(x1 + rectangleWidth);
            y2 = Math.round(y1 + rectangleHeight);
        }
        if (position == 'br')
        {
            x1 = Math.round(width - rectangleWidth);
            y1 = Math.round(height - rectangleHeight);
            x2 = Math.round(x1 + rectangleWidth);
            y2 = Math.round(y1 + rectangleHeight);
        }

        options.push('-gravity');
        options.push('northwest');

        options.push('-fill');
        options.push('#00000099');

        options.push('-draw');
        options.push('rectangle ' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + '');

        options.push('-fill');
        options.push('#FFFFFF');

        options.push('-font');
        options.push(this._font);

        options.push('-pointsize');
        options.push(fontSize + '');

        options.push('-draw');
        options.push('text ' + (x1 + paddingX) + ',' + (y1 + textHeight + paddingY) + ' "' + label + '"');
    }


    /**
     * Resizes given image so that it keeps its aspect ratio
     */
    resizeUnforced(name, width, height)
    {
        const scope = this;
        const promise = co(function*()
        {
            const cachePath = yield scope._pathesConfiguration.resolveCache('/' + scope._cacheName);
            yield fs.mkdirp(cachePath);

            // See if image needs to be resized
            const imageFilename = yield scope.resolveImageFilename(name);
            if (scope._resizableFileExtensions.indexOf(path.extname(imageFilename)) === -1 ||
                (width === 0 && height === 0))
            {
                return imageFilename;
            }

            // Check cache
            const cacheFilename = yield scope.resolveCacheFilename(imageFilename, width, height, false);
            if (scope._useCache)
            {
                const cacheFilenameExists = yield fs.exists(cacheFilename);
                if (cacheFilenameExists)
                {
                    return cacheFilename;
                }
            }

            // Calc dimensions
            const settings = yield scope.getImageSettings(imageFilename);
            const resizedSize = { width: width, height: height };
            if (resizedSize.width == 0 && resizedSize.height == 0)
            {
                resizedSize.width = settings.width;
                resizedSize.height = settings.height;
            }
            else if (resizedSize.width == 0)
            {
                resizedSize.width = Math.round((height / settings.height) * settings.width);
            }
            else if (resizedSize.height == 0)
            {
                resizedSize.height = Math.round((width / settings.width) * settings.height);
            }

            // Render
            const command = 'gm';
            const options = [];

            options.push('convert');
            options.push(imageFilename);

            options.push('-resize');
            //Resize only width
            if (width > 0 && height == 0)
            {
                options.push(width + 'x');
            }
            //Resize only height
            if (width == 0 && height > 0)
            {
                options.push('x' + height);
            }
            //Resize both
            if (width > 0 && height > 0)
            {
                options.push(width + 'x' + height);
            }
            //Resize none
            if (width == 0 && height == 0)
            {
                options.push('0x0');
            }

            // Label
            scope.addLabel(options, resizedSize.width, resizedSize.height, width + ' x ' + height);

            //Output quality
            options.push('-quality');
            options.push('75');
            options.push('+profile');
            options.push('*');

            //Target file
            options.push(cacheFilename);

            //Go
            child_process.spawnSync(command, options,
                {
                    stdio : 'inherit'
                });

            return cacheFilename;
        });
        return promise;
    }


    /**
     * Get cached image
     *
     * @param {string} filename
     * @param {number} width
     * @param {number} height
     * @param {string} forced
     * @returns {Promise<string>}
     */
    resizeForced(name, width, height, forced)
    {
        const scope = this;
        const promise = co(function*()
        {
            const cachePath = yield scope._pathesConfiguration.resolveCache('/' + scope._cacheName);
            yield fs.mkdirp(cachePath);

            // See if image needs to be resized
            const imageFilename = yield scope.resolveImageFilename(name);
            if (scope._resizableFileExtensions.indexOf(path.extname(imageFilename)) === -1 ||
                (width === 0 || height === 0))
            {
                return imageFilename;
            }

            // Check cache
            const cacheFilename = yield scope.resolveCacheFilename(imageFilename, width, height, forced);
            if (scope._useCache)
            {
                const cacheFilenameExists = yield fs.exists(cacheFilename);
                if (cacheFilenameExists)
                {
                    return cacheFilename;
                }
            }

            // Render
            const settings = yield scope.getImageSettings(imageFilename);
            const area = yield scope.calculateArea(width, height, forced, settings);
            let command = 'gm';
            let options = [];

            // Crop ----------------------------------------------
            options.push('convert');
            options.push(imageFilename);

            // Crop
            if (forced !== 'max')
            {
                options.push('-crop');
                options.push(area.width + 'x' + area.height + '+' + area.x + '+' + area.y);
            }

            // Quality
            options.push('-quality');
            options.push('100');
            options.push('+profile');
            options.push('*');

            // Outfile
            options.push(cacheFilename);

            // Go
            child_process.spawnSync(command, options,
                {
                    stdio : 'inherit'
                });

            // Resize ----------------------------------------------
            command = 'gm';
            options = [];
            options.push('convert');
            options.push(cacheFilename);

            // Resize
            options.push('-resize');
            if (forced === 'max')
            {
                options.push(width + 'x' + height + '\>');
            }
            else
            {
                options.push(width + 'x' + height + '^');
            }

            // Label
            scope.addLabel(options, width, height, width + ' x ' + height);

            // Quality
            options.push('-quality');
            options.push('75');
            options.push('+profile');
            options.push('*');

            // Outfile
            options.push(cacheFilename);

            //Go
            child_process.spawnSync(command, options,
                {
                    stdio : 'inherit'
                });

            return cacheFilename;
        });
        return promise;
    }


    /**
     * @param {string} name
     * @param {number} width
     * @param {number} height
     * @param {string} forced
     * @returns {Promise<*>}
     */
    resize(name, width, height, forced)
    {
        const scope = this;
        const promise = co(function*()
        {
            let result;
            if (!forced || forced == '0' || forced == '')
            {
                result = yield scope.resizeUnforced(name, width, height);
            }
            else
            {
                result = yield scope.resizeForced(name, width, height, forced);
            }
            return result;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageResizer = ImageResizer;
