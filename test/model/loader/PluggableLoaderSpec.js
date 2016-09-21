'use strict';

/**
 * Requirements
 */
const LoaderPlugin = require(SOURCE_ROOT + '/model/loader/LoaderPlugin.js').LoaderPlugin;
const PluggableLoader = require(SOURCE_ROOT + '/model/loader/PluggableLoader.js').PluggableLoader;
const baseLoaderSpec = require('../BaseLoaderShared.js').spec;
const sinon = require('sinon');
const co = require('co');


/**
 * Spec
 */
describe(PluggableLoader.className, function()
{
    baseLoaderSpec(PluggableLoader, 'model.loader/PluggableLoader');

    describe('#load', function()
    {
        it('should execute each registered plugin for each loaded item', function()
        {
            let plugin1 = new LoaderPlugin();
            sinon.spy(plugin1, 'execute');
            let plugin2 = new LoaderPlugin();
            sinon.spy(plugin2, 'execute');
            let loader = new PluggableLoader([plugin1, plugin2], ['item1', 'item2']);
            let promise = co(function *()
            {
                let items = yield loader.load();
                expect(items).to.have.length(2);
                expect(plugin1.execute.calledTwice).to.be.ok;
                expect(plugin2.execute.calledTwice).to.be.ok;
            });
            return promise;
        });

        it('should allow to customize the loaded items via the finalize method', function()
        {
            let loader = new PluggableLoader([], ['item1', 'item2']);
            sinon.spy(loader, 'finalize');
            let promise = co(function *()
            {
                let items = yield loader.load();
                expect(loader.finalize.calledOnce).to.be.ok;
            });
            return promise;
        });
    });
});
