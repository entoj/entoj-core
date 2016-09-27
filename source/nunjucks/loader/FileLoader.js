'use strict';

/**
 * Requirements
 * @ignore
 */
const fs = require('fs');
const path = require('path');
const Loader = require('nunjucks').Loader;
const CallParser = require('../../parser/jinja/CallParser.js').CallParser;
const ContentType = require('../../model/ContentType.js');
const DocumentationCallable = require('../../model/documentation/DocumentationCallable.js').DocumentationCallable;
const EntitiesRepository = require('../../model/entity/EntitiesRepository.js').EntitiesRepository;
const assertParameter = require('../../utils/assert.js').assertParameter;
const urls = require('../../utils/urls.js');
const synchronize = require('../../utils/synchronize.js');
const unique = require('lodash.uniq');
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
            this.entitiesRepository = entitiesRepository;
            this.jinjaParser = new CallParser();
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
            let result = this.checkAllPathes(file);

            //Check for simple shortcut to entity
            if (!result)
            {
                const parts = file.split(PATH_SEPERATOR);
                const aliased = file + PATH_SEPERATOR + parts.pop() + '.j2';
                //console.log(file + ' not found, trying ' + aliased);
                result = this.checkAllPathes(aliased);
            }

            return result;
        },


        /**
         * @returns {Promise}
         */
        getMacroInclude(name)
        {
            const items = synchronize.execute(this.entitiesRepository, 'getItems');
            for (const item of items)
            {
                const macros = item.documentation.filter(doc => doc.contentType == ContentType.JINJA && doc instanceof DocumentationCallable);
                for (const macro of macros)
                {
                    if (macro.name === name)
                    {
                        return '{% include "' + urls.normalize(macro.file.filename.replace(this.searchPaths[0], '')) + '" %}';
                    }
                }
            }

            return false;
        },


        /**
         * Prepares a template for rendering
         */
        prepareTemplate(template, exclude)
        {
            // Get macros
            const macros = synchronize.execute(this.jinjaParser, 'parse', [template]);

            // Build includes
            let includes = [];
            for (const macro of macros)
            {
                const include = this.getMacroInclude(macro);
                if (include)
                {
                    includes.push(include);
                }
            }
            includes = unique(includes);

            // Update template
            let result = template;
            for (const include of includes)
            {
                result = include + '\n' + result;
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
            let template = { src: fs.readFileSync(fullPath, { encoding: 'utf-8' }), path: fullPath, noCache: this.noCache };

            // Prepare it
            template.src = this.prepareTemplate(template.src, [fullPath]);

            return template;
        }
    });

/**
 * Exports
 * @ignore
 */
module.exports.FileLoader = FileLoader;
