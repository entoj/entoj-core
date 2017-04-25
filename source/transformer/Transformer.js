'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../Base.js').Base;
const BaseMap = require('../base/BaseMap.js').BaseMap;
const BaseRenderer = require('./BaseRenderer.js').BaseRenderer;
const BaseParser = require('./BaseParser.js').BaseParser;
const MacroNode = require('./node/MacroNode.js').MacroNode;
const GlobalRepository = require('../model/GlobalRepository.js').GlobalRepository;
const assertParameter = require('../utils/assert.js').assertParameter;
const co = require('co');
const crypto = require('crypto');


/**
 * Source code transformer
 */
class Transformer extends Base
{
    /**
     * @ignore
     */
    constructor(globalRepository, parser, renderer, nodeTransformers, nodeFinalTransformers)
    {
        super();

        // Check params
        assertParameter(this, 'globalRepository', globalRepository, true, GlobalRepository);
        assertParameter(this, 'parser', parser, true, BaseParser);
        assertParameter(this, 'renderer', renderer, true, BaseRenderer);

        // Assign options
        this._globalRepository = globalRepository;
        this._parser = parser;
        this._renderer = renderer;
        this._nodeTransformers = nodeTransformers || [];
        this._nodeFinalTransformers = nodeFinalTransformers || [];

        // Setup cache
        this._cache = new Map();
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [GlobalRepository, BaseParser, BaseRenderer, 'transformer/Transformer.nodeTransformers'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'transformer/Transformer';
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    parseString(source, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Check cache
            const id = crypto.createHash('md5').update(source).digest('hex');
            if (!scope._cache.has(id))
            {
                // Generate cache
                const parsed = yield scope._parser.parse(source);
                scope._cache.set(id, parsed);
            }

            // Return cache
            const parsed = scope._cache.get(id);
            if (parsed && parsed.clone)
            {
                return parsed.clone();
            }
            return false;
        });
        return promise;
    }



    /**
     * @returns {Promise<BaseNode>}
     */
    parseTemplate(siteQuery, entity, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Get template
            const template = entity.files.find((file) => file.contentType == 'jinja' && file.basename == entity.id.idString + '.j2');
            if (!template || !template.contents)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::parseTemplate - could not find template ' + entity.id.pathString);
            }

            // Parse file
            const rootNode = yield scope.parseString(template.contents, parameters);
            if (!rootNode)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::parseTemplate - could not parse source of template ' + entity.id.pathString);
            }

            return rootNode;
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    parseMacro(siteQuery, macroQuery, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Get macro
            const macro = yield scope._globalRepository.resolveMacro(siteQuery, macroQuery);
            if (!macro || !macro.file)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::parseMacro - could not find macro ' + macroQuery);
            }

            // Parse file
            const rootNode = yield scope.parseString(macro.file.contents, parameters);
            if (!rootNode)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::parseMacro - could not parse source for macro ' + macroQuery);
            }

            // Find macro node
            let macroNode;
            if (rootNode.children)
            {
                macroNode = rootNode.children.find((node) =>
                {
                    return node instanceof MacroNode && node.name === macro.name;
                });
            }
            else if (rootNode instanceof MacroNode)
            {
                macroNode = rootNode;
            }
            if (!macroNode)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + ':parseMacro - could not find macro ' + macroQuery + ' in parsed source');
            }

            return macroNode;
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseMap>}
     */
    getMacroProperties(siteQuery, macroQuery)
    {
        const scope = this;
        const promise = co(function *()
        {
            const entity = yield scope._globalRepository.resolveEntityForMacro(siteQuery, macroQuery);
            if (!entity)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::getMacroOptions - could not find entity for macro ' + macroQuery);
            }
            return entity.properties;
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseMap>}
     */
    getMacroSettings(siteQuery, macroQuery)
    {
        const scope = this;
        const promise = co(function *()
        {
            const properties = yield scope.getMacroProperties(siteQuery, macroQuery);
            let settings = {};
            if (properties)
            {
                const macroSettings = properties.getByPath('release.settings.macros', {});
                if (macroSettings[macroQuery])
                {
                    settings = macroSettings[macroQuery];
                }
                else if (macroSettings['*'])
                {
                    settings = macroSettings['*'];
                }
            }
            return new BaseMap(settings);
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseNode>}
     * @protected
     */
    transformNode(rootNode, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            let result = rootNode;
            for (const nodeTransformer of scope._nodeTransformers)
            {
                result = yield nodeTransformer.transform(result, scope);
            }
            return result;
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    renderNode(rootNode, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const result = yield scope._renderer.render(rootNode, parameters);
            return result;
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    transform(source, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Parse source
            const rootNode = yield scope.parseString(source, parameters);
            if (rootNode === false)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::transform - could not parse source');
            }

            // Transform parsed nodes
            const transformedRootNode = yield scope.transformNode(rootNode, parameters);
            if (!transformedRootNode)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + ':transform - could not transform parsed node');
            }

            // Render transformed nodes
            const result = yield scope.renderNode(transformedRootNode, parameters);
            return result;
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    transformTemplate(siteQuery, entity, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Parse macro
            const rootNode = yield scope.parseTemplate(siteQuery, entity, parameters);
            if (rootNode === false)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::transformTemplate - could not parse template');
            }

            // Transform parsed nodes
            const transformedRootNode = yield scope.transformNode(rootNode, parameters);
            if (!transformedRootNode)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + ':transformTemplate - could not transform parsed node');
            }

            // Render transformed nodes
            const result = yield scope.renderNode(transformedRootNode, parameters);
            return result;
        });
        return promise;
    }


    /**
     * @returns {Promise<BaseNode>}
     */
    transformMacro(siteQuery, macroQuery, parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Parse macro
            const rootNode = yield scope.parseMacro(siteQuery, macroQuery, parameters);
            if (rootNode === false)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + '::transformMacro - could not parse macro');
            }

            // Transform parsed nodes
            const transformedRootNode = yield scope.transformNode(rootNode, parameters);
            if (!transformedRootNode)
            {
                /* istanbul ignore next */
                throw new Error(scope.className + ':transformMacro - could not transform parsed node');
            }

            // Final transform parsed nodes
            let finalRootNode = transformedRootNode;
            for (const nodeTransformer of scope._nodeFinalTransformers)
            {
                finalRootNode = yield nodeTransformer.transform(finalRootNode, scope);
            }

            // Render transformed nodes
            const result = yield scope.renderNode(finalRootNode, parameters);
            return result;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Transformer = Transformer;
