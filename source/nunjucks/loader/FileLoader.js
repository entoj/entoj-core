'use strict';

/**
 * Requirements
 * @ignore
 */
const fs = require('fs');
const path = require('path');
const Loader = require('nunjucks').Loader;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const Template = require('../Template.js').Template;
const assertParameter = require('../../utils/assert.js').assertParameter;
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
        init: function(searchPaths, entitiesRepository, noWatch)
        {
            // Check params
            assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);

            // Assign
            this.noCache = true;
            this.pathsToNames = {};
            if (searchPaths)
            {
                searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
                this.searchPaths = searchPaths.map(path.normalize);
            }
            else
            {
                this.searchPaths = ['.'];
            }
            this._entitiesRepository = entitiesRepository;
            this._template = new Template(this._entitiesRepository, this.searchPaths[0]);
        },


        /**
         * Resolves a template file
         */
        checkAllPathes: function(filename)
        {
            let result = false;

            //Direct file?
            this.searchPaths.forEach(function(path)
            {
                try
                {
                    const file = pathes.concat(path, filename);
                    const stat = fs.statSync(file);
                    if (stat.isFile())
                    {
                        result = file;
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
            let result = this.checkAllPathes(file);

            //Check for simple shortcut to entity
            if (!result)
            {
                const parts = file.split(PATH_SEPERATOR);
                const aliased = file + PATH_SEPERATOR + parts.pop() + '.j2';
                result = this.checkAllPathes(aliased);
            }

            return result;
        },


        /**
         * @inheritDocs
         */
        getSource: function(name)
        {
            // Get filepath
            const fullPath = this.resolve(name);
            if (!fullPath)
            {
                //console.log('Could not resolve ' + name + '@' + fullPath);
                return null;
            }

            // Fetch template
            const template = { src: fs.readFileSync(fullPath, { encoding: 'utf-8' }), path: fullPath, noCache: this.noCache };

            // Prepare it
            template.src = this._template.prepare(template.src);

            return template;
        },


        /**
         * @inheritDocs
         */
        prepareSource: function(content)
        {
            return this._template.prepare(content);
        }
    });

/**
 * Exports
 * @ignore
 */
module.exports.FileLoader = FileLoader;
