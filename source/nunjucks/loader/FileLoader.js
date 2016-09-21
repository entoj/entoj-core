'use strict';

/**
 * Requirements
 * @ignore
 */
const fs = require('fs');
const path = require('path');
const Loader = require('nunjucks').Loader;
const pathes = require('../../utils/pathes.js');
const PATH_SEPERATOR = require('path').sep;


/**
 * Tries to guess template files when no full path is given
 *
 * @class
 * @memberOf nunjucks.loader
 */
const FileLoader = Loader.extend(
    {
        /**
         * @inheritDocs
         */
        init: function(searchPaths, noWatch)
        {
            //console.info('Initializing searchPaths =', searchPaths);
            this.noCache = true;
            this.pathsToNames = {};
            if (searchPaths)
            {
                searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
                this.searchPaths = searchPaths.map(path.normalize);
                //console.log('searchPaths', this.searchPaths);
            }
            else
            {
                this.searchPaths = ['.'];
            }
        },


        /**
         * Resolves a template file
         */
        checkAllPathes: function(filename)
        {
            //console.log('checkAllPathes(' + filename + ')');
            let result = false;

            //Direct file?
            this.searchPaths.forEach(function(path)
            {
                try
                {
                    const file = pathes.concat(path, filename);
                    //console.log('checkAllPathes =>' + file);
                    const stat = fs.statSync(file);
                    if (stat.isFile())
                    {
                        result = file;
                        //console.log('checkAllPathes =>' + file + ' is OK');
                    }
                }
                catch (e)
                {
                    //console.log('Exception :', e);
                }
            });

            return result;
        },


        /**
         * Resolves a template file
         */
        resolve: function(filename)
        {
            const file = pathes.normalizePathSeperators(filename);
            //console.log('resolve(' + file + ')');

            //Direct file?
            let result = this.checkAllPathes(file);

            //Check for simple shortcut to entity
            if (!result)
            {
                const parts = file.split(PATH_SEPERATOR);
                const aliased = file + PATH_SEPERATOR + parts.pop() + '.j2';
                //console.log(file + ' not found, trying ' + aliased);
                result = this.checkAllPathes(aliased);
            }

            if (!result)
            {
                //console.log('FileLoader => could not find ' + file);
            }

            return result;
        },


        /**
         * @inheritDocs
         */
        getSource: function(name)
        {
            const fullPath = this.resolve(name);
            if (!fullPath)
            {
                //console.log('Could not resolve ' + name + '@' + fullPath);
                return null;
            }
            this.pathsToNames[fullPath] = name;
            const result = { src: fs.readFileSync(fullPath, { encoding: 'utf-8' }), path: fullPath, noCache: this.noCache };
            return result;
        }
    });

/**
 * Exports
 * @ignore
 */
module.exports.FileLoader = FileLoader;
