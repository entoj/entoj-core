'use strict';

/**
 * Requirements
 */
const CliLogger = require(SOURCE_ROOT + '/cli/CliLogger.js').CliLogger;
const create = require(SOURCE_ROOT + '/utils/objects.js').create;
const BaseTask = require(SOURCE_ROOT + '/task/BaseTask.js').BaseTask;
const baseSpec = require(TEST_ROOT + '/BaseShared.js');
const sinon = require('sinon');
const co = require('co');
const memoryStream = require('memory-streams');


/**
 * Shared BaseTask spec
 */
function spec(type, className, prepareParameters, options)
{
    const opts = options || {};

    /**
     * Base Test
     */
    baseSpec(type, className, prepareParameters);


    /**
     * BaseTask Test
     */
    const createTestee = function()
    {
        let parameters = Array.from(arguments);
        if (prepareParameters)
        {
            parameters = prepareParameters(parameters);
        }
        return create(type, parameters);
    };


    /**
     * Reads the given strean and resolves to an array of all chunks
     */
    function readStream(stream)
    {
        const promise = new Promise((resolve) =>
        {
            const data = [];
            stream.on('data', (item) =>
            {
                process.nextTick(() =>
                {
                    data.push(item);
                });
            })
            .on('finish', () =>
            {
                process.nextTick(() =>
                {
                    resolve(data);
                });
            });
        });
        return promise;
    }
    spec.readStream = readStream;


    describe('#pipe()', function()
    {
        it('should return the piped taks', function()
        {
            const testee = createTestee();
            const pipedTestee = createTestee();
            const result = testee.pipe(pipedTestee);
            expect(result).to.be.equal(pipedTestee);
            return result;
        });

        it('should set previousTask on the piped task', function()
        {
            const testee = createTestee();
            const pipedTestee = createTestee();
            const result = testee.pipe(pipedTestee);
            expect(pipedTestee.previousTask).to.be.equal(testee);
            return result;
        });

        it('should set nextTask on the task', function()
        {
            const testee = createTestee();
            const pipedTestee = createTestee();
            const result = testee.pipe(pipedTestee);
            expect(testee.nextTask).to.be.equal(pipedTestee);
            return result;
        });
    });


    describe('#stream()', function()
    {
        it('should return a stream', function(cb)
        {
            const testee = createTestee();
            const consumer = new memoryStream.WritableStream({ objectMode: true });
            const result = testee.stream();
            expect(result.pipe).to.be.instanceof(Function); // We want to support through2 here....
            result.pipe(consumer);
            result.on('finish', cb);
        });
    });


    describe('#run()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const result = testee.run();
            expect(result).to.be.instanceof(Promise);
            return result;
        });

        if (!opts.skipDelegateTest)
        {
            it('should delegate to the root task', function()
            {
                const promise = co(function *()
                {
                    const testee = createTestee();
                    const pipedTestee = createTestee();
                    sinon.spy(testee, 'run');
                    sinon.spy(pipedTestee, 'run');
                    testee.pipe(pipedTestee);
                    yield pipedTestee.run();
                    expect(testee.run.calledOnce).to.be.ok;
                    expect(pipedTestee.run.calledOnce).to.be.ok;
                }).catch((e) => console.log(e));
                return promise;
            });
        }
    });

};

/**
 * Exports
 */
module.exports = spec;
