'use strict';

/**
 * Requirements
 * @ignore
 */
const Parser = require('../Parser.js').Parser;
const ContentType = require('../../model/ContentType.js');
const DocumentationCode = require('../../model/documentation/DocumentationCode.js').DocumentationCode;
const DocumentationCallable = require('../../model/documentation/DocumentationCallable.js').DocumentationCallable;
const DocumentationParameter = require('../../model/documentation/DocumentationParameter.js').DocumentationParameter;
const DocumentationCompoundParameter = require('../../model/documentation/DocumentationCompoundParameter.js').DocumentationCompoundParameter;
const DocumentationVariable = require('../../model/documentation/DocumentationVariable.js').DocumentationVariable;
const DocumentationClass = require('../../model/documentation/DocumentationClass.js').DocumentationClass;
const DocumentationExample = require('../../model/documentation/DocumentationExample.js').DocumentationExample;
const docblockParser = require('docblock-parser');
const docblockMultilineTilTag = require('docblock-parser/lib/consumers').multilineTilTag;
const docblockMultilineTilEmptyLineOrTag = require('docblock-parser/lib/consumers').multilineTilEmptyLineOrTag;
const docblockBooleanTag = require('docblock-parser/lib/consumers').booleanTag;
const docblockSingleParameterTag = require('docblock-parser/lib/consumers').singleParameterTag;
const fixWhitespace = require('../../utils/markdown.js').fixWhitespace;
const pull = require('lodash.pull');
const clone = require('lodash.clone');
const upperFirst = require('lodash.upperfirst');


/**
 * A DocBlock to documentation parser
 */
class DocBlockParser extends Parser
{
    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'parser.documentation/DocBlockParser';
    }


    /**
     * Maps a arbitrary type to a known type
     *
     * @protected
     * @param {String} type
     * @returns {String}
     */
    static mapType(type)
    {
        if (!type)
        {
            return '*';
        }
        let result = type;
        switch(type.toLowerCase())
        {
            case 'bool':
                result = 'Boolean';
                break;

            case 'int':
            case 'integer':
            case 'float':
                result = 'Number';
                break;

            case 'enum':
                result = 'Enumeration';
                break;
        }

        result = upperFirst(result);

        return result;
    }


    /**
     * @protected
     * @param {String} contentType
     * @return {Object}
     */
    getConfig(contentType)
    {
        const result =
        {
            text: docblockMultilineTilTag,
            default: docblockMultilineTilTag,
            tags:
            {
                augments: docblockSingleParameterTag,
                author: docblockMultilineTilEmptyLineOrTag,
                borrows: docblockMultilineTilEmptyLineOrTag,
                class: docblockMultilineTilTag,
                constant: docblockBooleanTag,
                constructor: docblockBooleanTag,
                constructs: docblockBooleanTag,
                color: docblockBooleanTag,
                default: docblockSingleParameterTag,
                deprecated: docblockMultilineTilEmptyLineOrTag,
                desciption: docblockMultilineTilTag,
                event: docblockBooleanTag,
                example: docblockMultilineTilTag,
                extends: docblockSingleParameterTag,
                field: docblockBooleanTag,
                fileOverview: docblockMultilineTilTag,
                function: docblockBooleanTag,
                group: docblockSingleParameterTag,
                ignore: docblockBooleanTag,
                inner: docblockBooleanTag,
                lends: docblockSingleParameterTag,
                memberOf: docblockSingleParameterTag,
                name: docblockMultilineTilEmptyLineOrTag,
                namespace: docblockSingleParameterTag,
                param: docblockMultilineTilEmptyLineOrTag,
                private: docblockBooleanTag,
                protected: docblockBooleanTag,
                property: docblockMultilineTilEmptyLineOrTag,
                public: docblockBooleanTag,
                requires: docblockMultilineTilEmptyLineOrTag,
                returns: docblockMultilineTilEmptyLineOrTag,
                see: docblockSingleParameterTag,
                since: docblockSingleParameterTag,
                static: docblockBooleanTag,
                throws: docblockMultilineTilEmptyLineOrTag,
                type: docblockSingleParameterTag,
                let: docblockMultilineTilEmptyLineOrTag,
                version: docblockMultilineTilEmptyLineOrTag
            }
        };

        if (contentType == ContentType.JINJA)
        {
            result.docBlockPattern = /\{#+((.|[\n\t\s])*?)#+\}/ig;
            result.startPattern = /^\s*\{#+\s?/;
            result.linePattern = //;
            result.endPattern = /#+\}\s*$/;
        }

        return result;
    }


    /**
     * Parse types in the form {type|...}
     *
     * @protected
     * @param {Object} data - a simple type string
     * @returns {Array}
     */
    parseType(data)
    {
        const result = [];
        let matches;
        if (data)
        {
            matches = data.match(/\{(.*)\}/);
        }
        if (matches)
        {
            const types = matches[1].split('|');
            types.forEach(function(rawType)
            {
                result.push(DocBlockParser.mapType(rawType));
            }, this);
        }
        else
        {
            result.push('*');
        }

        return result;
    }


    /**
     * @protected
     * @param {Object} data - a parsed, raw docblock
     * @param {model.documentation.DocumentationBase} vo
     * @returns {void}
     */
    parseBase(data, vo)
    {
        // Add base data
        vo.description = data.text;
        vo.description+= data.tags['description'] ? '\n' + data.tags['description'].trim() : '';
        vo.description = fixWhitespace(vo.description);
        vo.name = data.tags['name'] ? data.tags['name'].trim() : '';
        if (data.tags['group'])
        {
            vo.group = data.tags['group'].trim();
        }
        if (data.tags['tags'])
        {
            const tags = data.tags['tags'].split(',');
            for(const tag of tags)
            {
                vo.tags.push(tag.trim());
            }
        }

        // Add code specific base data
        if (vo instanceof DocumentationCode)
        {
            vo.namespace = data.tags['namespace'] ? data.tags['namespace'].trim() : '';
            if (data.tags['protected'])
            {
                vo.visibility = 'protected';
            }
        }
    }


    /**
     * @protected
     * @param {DocumentationCallable} callable
     * @param {Object} data - a parsed, raw param docblock
     * @returns {model.documentation.DocumentationCallable}
     */
    addParam(callable, data)
    {
        let parameter;
        const lines = data.split('\n');
        let line = lines.shift();
        let matches = line.match(/((\{.*\})\s+)?([\$\w\.\-_]+|\[[\$\w\.\-_\=\s]+\])(\s+-\s+(.*))?/);
        let name = matches[3] ? matches[3].trim() : undefined;
        let defaultValue = undefined;
        const description = matches[5] ? matches[5].trim() : undefined;
        const type = this.parseType(matches[2]);
        const isOptional = name.startsWith('[');

        // Optional & default values
        if (isOptional)
        {
            name = name.substr(1, name.length - 2);
            if (name.indexOf('=') > -1)
            {
                const nameSplit = name.split('=');
                name = nameSplit[0].trim();
                defaultValue = nameSplit[1].trim();
            }
        }

        // Compound?
        if (name && name.indexOf('.') > 0)
        {
            const names = name.split('.');

            // Get or create the parent
            let parentParameter = callable.parameters.find(param => param.name === names[0]);
            if (parentParameter && !(parentParameter instanceof DocumentationCompoundParameter))
            {
                pull(callable.parameters, parentParameter);
                const oldParameter = parentParameter;
                parentParameter = new DocumentationCompoundParameter();
                parentParameter.name = oldParameter.name;
                parentParameter.type = clone(oldParameter.type);
                parentParameter.description = oldParameter.description;
                callable.parameters.push(parentParameter);
            }
            if (!parentParameter)
            {
                parentParameter = new DocumentationCompoundParameter();
                parentParameter.name = names[0];
                callable.parameters.push(parentParameter);
            }

            // Change name
            names.shift();
            name = names.join('.');

            // Create param
            parameter = new DocumentationParameter();
            parentParameter.children.push(parameter);
        }
        else
        {
            parameter = new DocumentationParameter();
            callable.parameters.push(parameter);
        }

        // Default data
        parameter.name = name;
        parameter.description = description;
        parameter.type = type;
        parameter.isOptional = isOptional;
        parameter.defaultValue = defaultValue;

        //Enumeration?
        const isEnumeration = parameter.type.indexOf('Enumeration') > -1;
        while (lines.length > 0 && isEnumeration)
        {
            line = lines.shift();
            matches = line.match(/(\w+)(\s+-\s+(.*))?/);
            const enumerationValue = new DocumentationCode();
            enumerationValue.name = matches && matches[1] ? matches[1].trim() : '';
            enumerationValue.description = matches && matches[3] ? matches[3].trim() : '';
            parameter.enumeration.push(enumerationValue);
        }

        // Multiline comment
        while (lines.length > 0 && !isEnumeration)
        {
            if (!parameter.description)
            {
                parameter.description = '';
            }
            parameter.description+= '\n' + lines.shift().trim();
        }
        if (parameter.description)
        {
            parameter.description = parameter.description.trim();
        }
    }


    /**
     * @protected
     * @param {Object} data - a parsed, raw docblock
     * @returns {model.documentation.DocumentationCallable}
     */
    createCallable(data)
    {
        const result = new DocumentationCallable();
        this.parseBase(data, result);

        if (typeof data.tags['param'] !== 'undefined')
        {
            const params = Array.isArray(data.tags['param']) ? data.tags['param'] : [data.tags['param']];
            params.forEach(function(param)
            {
                this.addParam(result, param);
            }, this);
        }

        return result;
    }


    /**
     * @protected
     * @param {Object} data - a parsed, raw docblock
     * @returns {model.documentation.DocumentationVariable}
     */
    createVariable(data)
    {
        const result = new DocumentationVariable();
        this.parseBase(data, result);
        result.type = this.parseType(data.tags['type']);
        if (data.tags['value'])
        {
            result.value = data.tags['value'].trim();
        }

        return result;
    }


    /**
     * @param {Object} data - a parsed, raw docblock
     * @protected
     * @returns {model.documentation.DocumentationClass}
     */
    createClass(data)
    {
        const result = new DocumentationClass();
        this.parseBase(data, result);

        return result;
    }


    /**
     * @protected
     * @param {Object} data - a parsed, raw docblock
     * @returns {model.documentation.DocumentationExample}
     */
    createExample(data)
    {
        const result = new DocumentationExample();
        this.parseBase(data, result);

        return result;
    }


    /**
     * @protected
     * @param {Object} data - a parsed, raw docblock
     * @returns {model.documentation.DocumentationCode}
     */
    createCode(data)
    {
        const result = new DocumentationCode();
        this.parseBase(data, result);

        return result;
    }


    /**
     * @param {string} options
     * @returns {Promise<Object>}
     */
    parse(content, options)
    {
        if (!content || content.trim() === '')
        {
            Promise.resolve(false);
        }

        // Get options
        const contentType = options.contentType || ContentType.JS;
        const hint = options.hint || false;

        // Parse docblock
        const parsed = docblockParser(this.getConfig(contentType)).parse(content.trim());

        // Check @ignore
        if (typeof parsed.tags['ignore'] !== 'undefined')
        {
            return Promise.resolve(false);
        }

        // Create VO
        let result = false;
        if (typeof parsed.tags['param'] !== 'undefined' ||
            typeof parsed.tags['function'] !== 'undefined' ||
            parsed.tags['kind'] === 'function' ||
            hint === 'callable')
        {
            result = this.createCallable(parsed);
        }
        else if (typeof parsed.tags['type'] !== 'undefined' ||
                 parsed.tags['kind'] === 'variable' ||
                 hint === 'variable')
        {
            result = this.createVariable(parsed);
        }
        else if (typeof parsed.tags['class'] !== 'undefined' ||
                 parsed.tags['kind'] === 'class' ||
                 hint === 'class')
        {
            result = this.createClass(parsed);
        }
        else if (typeof parsed.tags['example'] !== 'undefined' ||
                 parsed.tags['kind'] === 'example' ||
                 hint === 'example')
        {
            result = this.createExample(parsed);
        }
        else
        {
            result = this.createCode(parsed);
        }
        result.contentType = contentType;

        return Promise.resolve(result);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.DocBlockParser = DocBlockParser;
