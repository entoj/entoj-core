'use strict';

/**
 * Requirements
 */
const EnvironmentActivator = require(SOURCE_ROOT + '/source/EnvironmentActivator.js').EnvironmentActivator;
const baseSpec = require('../BaseShared.js').spec;

/**
 * Spec
 */
describe(EnvironmentActivator.className, function()
{
    beforeEach(function()
    {
        fixtures = {};
    });

    baseSpec(EnvironmentActivator, 'source/EnvironmentActivator');

    describe('#activate()', function()
    {
        it('should remove all environments when no environment is given', function()
        {
            const testee = new EnvironmentActivator();
            const input = `
            /**
             * Configure logger
             */
            let log = debug('global/application');
            /* +environment: development */
            debug.enable('*');
            /* -environment */
            /* +environment: production */
            debug.disable('*');
            /* -environment */
            `;
            const expected = `
            /**
             * Configure logger
             */
            let log = debug('global/application');`;
            const promise = testee.activate(input).then(function (source)
            {
                expect(source).to.not.have.string('debug.enable('*');');
                expect(source).to.not.have.string('debug.disable('*');');
            });
            return promise;
        });

        it('should remove all environments except the given one', function()
        {
            const testee = new EnvironmentActivator();
            const input = `
            /**
             * Configure logger
             */
            let log = debug('global/application');
            /* +environment: development */
            debug.enable('*');
            /* -environment */
            /* +environment: production */
            debug.disable('*');
            /* -environment */
            `;
            const expected = `
            /**
             * Configure logger
             */
            let log = debug('global/application');`;
            const promise = testee.activate(input, 'development').then(function (source)
            {
                expect(source).to.have.string("debug.enable('*');");
                expect(source).to.not.have.string("debug.disable('*');");
            });
            return promise;
        });
    });
});
