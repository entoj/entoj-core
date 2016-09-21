'use strict';

/**
 * Requirements
 * @ignore
 */
let BaseCommand = require('./BaseCommand.js').BaseCommand;
let BuildConfiguration = require('../model/configuration/BuildConfiguration.js').BuildConfiguration;
let Context = require('../application/Context.js').Context;
let CliWriter = require('../cli/CliWriter.js').CliWriter;
let js = require('../gulp/task/js.js');
let gulp = require('gulp');


/**
 * @memberOf command
 */
class JsCommand extends BaseCommand
{
    /**
     */
    constructor(context)
    {
        super(context);

        this._name = 'js';
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'command/JsCommand';
    }


    /**
     * @inheritDocs
     */
    get help()
    {
        let help =
        {
            name: this._name,
            description: 'Compiles and optimizes js files',
            actions:
            [
                {
                    name: 'compile',
                    options:
                    {
                        '--site': "Restrict processing to a specific site",
                        '--environment': "Specifies the build environment."
                    },
                    description: 'Compiles all js files for the given site(s)',
                },
                {
                    name: 'watch',
                    options:
                    {
                        '--site': "Restrict processing to a specific site",
                        '--environment': "Specifies the build environment."
                    },
                    description: 'Watches for changes and compiles all js files for the given site(s) when necessary',
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    compile(parameters)
    {
        let scope = this;
        return new Promise(function(resolve, reject)
        {
            let cliWriter = scope.context.di.create(CliWriter);
            cliWriter.startSection('Command js compile');
            let result = gulp.start('js.compile');
            gulp.on('stop', function()
            {
                cliWriter.endSection('Command js compile');
                resolve();
            });
        });
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    watch(parameters)
    {
        let scope = this;
        return new Promise(function(resolve, reject)
        {
            let cliWriter = scope.context.di.create(CliWriter);
            cliWriter.startSection('Command js watch');
            let result = gulp.start('js.watch');
            resolve();
        });
    }


    /**
     * @inheritDocs
     * @returns {Promise<Server>}
     */
    doExecute(parameters)
    {
        if (parameters.action === 'watch')
        {
            return this.watch(parameters);
        }
        return this.compile(parameters);
    }
}


/**
 * Exports
 */
module.exports.JsCommand = JsCommand;
