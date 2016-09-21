
/**
 * @namespace entity
 */
module.exports =
{
    BaseRepository: require('./model/BaseRepository.js').BaseRepository,
    SassRepository: require('./model/SassRepository.js').SassRepository,
    JsRepository: require('./model/JsRepository.js').JsRepository,
    html: require('./task/html.js'),
    sass: require('./task/sass.js'),
    js: require('./task/js.js')
};
