"use strict";

/**
 * Requirements
 */
let SitesRepository = require(SOURCE_ROOT + '/model/site/SitesRepository.js').SitesRepository;
let SitesLoader = require(SOURCE_ROOT + '/model/site/SitesLoader.js').SitesLoader;
let PackagePlugin = require(SOURCE_ROOT + '/model/loader/documentation/PackagePlugin.js').PackagePlugin;
let MarkdownPlugin = require(SOURCE_ROOT + '/model/loader/documentation/MarkdownPlugin.js').MarkdownPlugin;
let ContentType = require(SOURCE_ROOT + '/model/ContentType.js');
let ContentKind = require(SOURCE_ROOT + '/model/ContentKind.js');
let baseRepositorySpec = require('../BaseRepositoryShared.js').spec;
let compact = require(FIXTURES_ROOT + '/Entities/Compact.js');
let co = require('co');

/**
 * Spec
 */
describe(SitesRepository.className, function()
{
    baseRepositorySpec(SitesRepository, 'model.site/SitesRepository');


    describe('#getItems', function()
    {
        it('should load all data specified by the loader plugins', function()
        {
            let fixture = compact.createFixture();
            let loader = new SitesLoader(fixture.pathes, [new PackagePlugin(fixture.pathes), new MarkdownPlugin(fixture.pathes)]);
            let testee = new SitesRepository(loader);
            let promise = co(function *()
            {
                let sites = yield testee.getItems();
                expect(sites).to.have.length(2);

                //Site default
                let siteDefault = sites[0];
                expect(siteDefault.files.filter(file => file.contentType == ContentType.MARKDOWN)).to.have.length(1);
                expect(siteDefault.files.find(file => file.basename == 'default.md')).to.be.ok;
                expect(siteDefault.documentation.filter(doc => doc.contentKind == ContentKind.TEXT)).to.have.length(1);
                expect(siteDefault.properties.tags).to.contain('common');

                //Site extended
                let siteExtended = sites[1];
                expect(siteExtended.properties.extend).to.be.equal('default');
            });
            return promise;
        });
    });
});
