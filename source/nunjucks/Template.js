'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const EntitiesRepository = require('../model/entity/EntitiesRepository.js').EntitiesRepository;
const CallParser = require('../parser/jinja/CallParser.js').CallParser;
const ContentType = require('../model/ContentType.js');
const DocumentationCallable = require('../model/documentation/DocumentationCallable.js').DocumentationCallable;
const synchronize = require('../utils/synchronize.js');
const stopWatch = require('../utils/StopWatch.js').stopWatch;
const urls = require('../utils/urls.js');
const unique = require('lodash.uniq');
const assertParameter = require('../utils/assert.js').assertParameter;


/**
 * @memberOf nunjucks
 */
class Template extends Base
{
    /**
     * @param {EntitiesRepository} entitiesRepository
     * @param {Object} options
     */
    constructor(entitiesRepository, basePath)
    {
        super();

        // Check params
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);

        // Add options
        this._basePath = basePath || '';
        this._entitiesRepository = entitiesRepository;
        this._callParser = new CallParser();
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, 'nunjucks/Template.options'] };
    }


    /**
     * The namespaced class name
     *
     * @type {string}
     * @static
     */
    static get className()
    {
        return 'nunjucks/Template';
    }


    /**
     * @returns {Boolean|String}
     */
    getInclude(name)
    {
        stopWatch.start(this.className + '.getInclude');
        stopWatch.start(this.className + '.getInclude:getItems');
        const items = synchronize.execute(this._entitiesRepository, 'getItems');
        stopWatch.stop(this.className + '.getInclude:getItems');
        for (const item of items)
        {
            const macros = item.documentation.filter(doc => doc.contentType == ContentType.JINJA && doc instanceof DocumentationCallable);
            for (const macro of macros)
            {
                if (macro.name === name)
                {
                    stopWatch.stop(this.className + '.getInclude');
                    return '{% from "' + urls.normalize(macro.file.filename.replace(this._basePath, '')) + '" import ' + macro.name + ' %}';
                }
            }
        }
        stopWatch.stop(this.className + '.getInclude');
        return false;
    }


    /**
     * Prepares a template for rendering
     */
    prepare(content)
    {
        stopWatch.start(this.className + '.prepare');

        // Get macros
        const macros = synchronize.execute(this._callParser, 'parse', [content]);

        // Build includes
        let includes = [];
        for (const macro of macros.externals)
        {
            const include = this.getInclude(macro);
            if (include)
            {
                includes.push(include);
            }
        }
        includes = unique(includes);

        // Update template
        let result = content;
        for (const include of includes)
        {
            result = include + '\n' + result;
        }

        stopWatch.stop(this.className + '.prepare');
        this.logger.verbose('Prepared Template\n', result);

        return result;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Template = Template;
