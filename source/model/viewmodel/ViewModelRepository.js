'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('../../Base.js').Base;
const ViewModel = require('./ViewModel.js').ViewModel;
const EntitiesRepository = require('../entity/EntitiesRepository.js').EntitiesRepository;
const PathesConfiguration = require('../configuration/PathesConfiguration.js').PathesConfiguration;
const path = require('path');
const pathes = require('../../utils/pathes.js');
const assertParameter = require('../../utils/assert.js').assertParameter;
const uppercaseFirst = require('../../utils/string.js').uppercaseFirst;
const glob = require('../../utils/glob.js');
const co = require('co');
const fs = require('fs');
const isObject = require('lodash.isobject');
const isString = require('lodash.isstring');
const lorem = require('lorem-ipsum');


/**
 * A static random value generator
 */
let randomIndex = 0;
function random()
{
    const randomValue = [ 540, 590, 495, 557, 693, 936, 744, 49, 417, 950, 586, 713, 527, 301, 30, 44, 61, 530, 957, 748, 444, 526, 578, 101, 951, 237, 35, 86, 795, 308, 295, 993, 48, 477, 572, 666, 499, 849, 660, 538, 342, 818, 579, 757, 249, 776, 155, 500, 100, 884, 438, 823, 839, 397, 157, 732, 263, 929, 846, 747, 786, 587, 597, 214, 731, 976, 281, 664, 488, 803, 162, 777, 432, 258, 800, 2, 574, 932, 158, 259, 688, 687, 469, 255, 504, 856, 511, 232, 844, 709, 190, 306, 29, 304, 150, 550, 198, 447, 888, 778, 373, 103, 826, 146, 870, 433, 206, 189, 761, 224, 418, 253, 284, 339, 275, 867, 901, 238, 981, 79, 261, 359, 740, 451, 781, 472, 93, 893, 307, 654, 729, 775, 399, 736, 825, 835, 824, 719, 156, 378, 889, 669, 434, 439, 490, 126, 282, 22, 32, 312, 413, 286, 739, 822, 458, 193, 641, 938, 83, 291, 137, 505, 226, 56, 710, 646, 539, 806, 492, 482, 294, 714, 394, 827, 717, 160, 267, 801, 437, 955, 656, 31, 507, 145, 649, 979, 337, 984, 136, 186, 440, 831, 99, 104, 658, 707, 678, 905, 203, 577, 900, 336, 348, 913, 19, 811, 902, 371, 510, 293, 369, 833, 769, 314, 770, 92, 684, 563, 840, 24, 129, 385, 698, 34, 392, 278, 276, 463, 445, 248, 892, 722, 299, 380, 589, 391, 184, 412, 283, 798, 271, 879, 784, 63, 431, 887, 790, 927, 727, 393, 94, 319, 952, 266, 464, 247, 229, 430, 127, 949, 878, 1000, 332, 147, 886, 36, 33, 738, 242, 566, 459, 595, 635, 791, 501, 663, 994, 881, 287, 866, 37, 50, 353, 202, 872, 387, 0, 370, 618, 243, 992, 429, 608, 310, 535, 7, 576, 997, 82, 809, 354, 863, 89, 151, 234, 169, 759, 448, 462, 549, 876, 72, 896, 743, 891, 939, 252, 120, 603, 489, 581, 358, 436, 599, 405, 87, 356, 111, 386, 819, 323, 689, 322, 720, 573, 297, 610, 991, 13, 850, 329, 634, 460, 723, 512, 333, 633, 362, 569, 969, 185, 225, 999, 764, 279, 21, 303, 478, 890, 742, 168, 470, 899, 349, 808, 173, 568, 179, 600, 59, 192, 54, 102, 596, 175, 711, 580, 523, 422, 963, 637, 625, 12, 244, 785, 344, 486, 317, 51, 700, 942, 70, 644, 220, 868, 199, 228, 721, 960, 702, 685, 708, 911, 705, 1, 320, 706, 841, 843, 171, 114, 324, 541, 123, 376, 995, 525, 996, 277, 760, 838, 341, 754, 39, 515, 481, 715, 153, 416, 498, 383, 246, 662, 347, 665, 601, 982, 231, 862, 148, 316, 553, 26, 379, 450, 415, 647, 188, 562, 897, 640, 783, 326, 774, 624, 121, 667, 650, 483, 898, 18, 453, 302, 325, 946, 651, 737, 584, 421, 80, 771, 167, 797, 52, 987, 847, 966, 516, 67, 177, 531, 692, 113, 241, 961, 216, 965, 726, 816, 858, 765, 985, 813, 983, 298, 766, 423, 593, 837, 288, 471, 828, 614, 159, 851, 395, 305, 904, 389, 149, 134, 289, 402, 467, 268, 787, 968, 502, 543, 834, 907, 76, 933, 954, 799, 200, 974, 315, 88, 334, 239, 68, 956, 673, 62, 701, 694, 509, 176, 138, 788, 690, 716, 262, 211, 139, 967, 272, 921, 639, 213, 903, 749, 718, 947, 257, 864, 227, 552, 528, 670, 857, 441, 133, 456, 750, 542, 571, 604, 609, 368, 235, 755, 374, 547, 468, 558, 338, 746, 814, 194, 583, 989, 962, 454, 124, 410, 367, 592, 945, 554, 545, 696, 842, 953, 491, 585, 400, 964, 260, 768, 591, 27, 532, 77, 3, 181, 699, 970, 605, 621, 403, 986, 546, 240, 351, 895, 906, 544, 264, 71, 853, 978, 390, 792, 627, 922, 920, 629, 15, 894, 115, 561, 756, 931, 848, 612, 419, 90, 935, 207, 144, 140, 671, 296, 388, 143, 735, 653, 215, 116, 364, 804, 796, 560, 484, 170, 10, 209, 734, 331, 290, 38, 152, 28, 859, 236, 661, 767, 636, 794, 476, 948, 613, 518, 668, 832, 606, 300, 75, 865, 407, 924, 163, 780, 751, 269, 782, 396, 582, 877, 335, 245, 183, 861, 852, 697, 973, 9, 648, 182, 446, 521, 620, 97, 180, 487, 53, 218, 55, 615, 943, 691, 513, 533, 874, 273, 20, 762, 452, 496, 631, 107, 106, 575, 465, 221, 95, 65, 166, 46, 820, 398, 45, 330, 556, 703, 117, 506, 677, 959, 164, 321, 135, 869, 645, 520, 802, 366, 821, 672, 602, 256, 254, 424, 815, 741, 570, 128, 165, 118, 860, 567, 91, 11, 475, 534, 85, 191, 643, 346, 352, 406, 47, 916, 817, 274, 340, 292, 345, 311, 74, 125, 42, 280, 43, 885, 196, 971, 807, 357, 141, 201, 355, 875, 493, 652, 132, 845, 758, 555, 925, 6, 642, 197, 975, 930, 883, 810, 187, 772, 98, 873, 443, 519, 105, 855, 5, 958, 763, 251, 972, 17, 142, 119, 361, 404, 944, 318, 41, 789, 537, 384, 980, 414, 381, 409, 626, 66, 728, 130, 212, 427, 4, 508, 919, 564, 210, 69, 630, 480, 122, 628, 14, 623, 934, 998, 174, 880, 536, 529, 479, 638, 682, 73, 712, 686, 96, 78, 485, 204, 676, 195, 611, 622, 940, 632, 914, 657, 988, 343, 131, 208, 435, 109, 679, 411, 285, 908, 64, 360, 912, 588, 598, 58, 990, 372, 725, 548, 250, 517, 928, 773, 25, 733, 8, 836, 60, 112, 110, 617, 473, 161, 466, 704, 730, 205, 375, 428, 812, 457, 40, 779, 941, 854, 365, 377, 154, 745, 217, 937, 805, 514, 16, 909, 425, 680, 461, 219, 524, 222, 455, 829, 382, 910, 420, 442, 681, 594, 350, 559, 23, 915, 793, 233, 926, 918, 363, 265, 830, 178, 449, 172, 57, 977, 108, 616, 313, 426, 674, 923, 565, 695, 230, 871, 84, 270, 408, 327, 401, 655, 497, 882, 223, 683, 619, 675, 474, 917, 752, 328, 503, 309, 551, 522, 724, 494, 81, 607, 753, 659];
    const value = randomValue[randomIndex++] / 1000;
    if (randomIndex > randomValue.length - 1)
    {
        randomIndex = 0;
    }
    return value;
}


/**
 * @class
 * @memberOf model.file
 * @extends {Base}
 */
class ViewModelRepository extends Base
{
    /**
     * @param {model.entity.EntitiesRepository} entitiesRepository
     */
    constructor(entitiesRepository, pathesConfiguration)
    {
        super();

        // Check params
        assertParameter(this, 'entitiesRepository', entitiesRepository, true, EntitiesRepository);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign
        this._entitiesRepository = entitiesRepository;
        this._pathesConfiguration = pathesConfiguration;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [EntitiesRepository, PathesConfiguration] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.viewmodel/ViewModelRepository';
    }


    /**
     * @param {String} parameters
     * @returns {Promise}
     */
    generateLipsum(params, useStaticContent)
    {
        // Prepare
        const options =
        {
            units: 'words',
            count: 1
        };

        // Parse params
        let min = 1;
        let max = 10;
        if (params.length > 0)
        {
            if (params[0] == 'w' || params[0] == 's' || params[0] == 'p')
            {
                const unitsShort = params.shift();
                if (unitsShort == 's')
                {
                    options.units = 'sentences';
                }
                if (unitsShort == 'p')
                {
                    options.units = 'paragraphs';
                }
            }
            if (params.length == 1)
            {
                max = parseInt(params[0], 10);
            }
            else if (params.length == 2)
            {
                min = parseInt(params[0], 10);
                max = parseInt(params[1], 10);
            }
        }
        if (useStaticContent)
        {
            options.random = random;
            options.count = max;
        }
        else
        {
            options.count = min + ((max - min) * Math.random());
        }

        // Go
        return uppercaseFirst(lorem(options));
    }


    /**
     * @param {String} parameters
     * @returns {Promise}
     */
    lipsumMacro(parameters, site, useStaticContent)
    {
        // Prepare
        const params = parameters.split(',');

        // Go
        return Promise.resolve(this.generateLipsum(params, useStaticContent));
    }


    /**
     * @param {String} parameters
     * @returns {Promise}
     */
    lipsumHtmlMacro(parameters, site, useStaticContent)
    {
        // Prepare
        const params = parameters.split(',');
        const lipsum = this.generateLipsum(params, useStaticContent);

        // Transform to html
        const paragraphs = lipsum.split('\n');
        let result = '';
        for (let paragraph of paragraphs)
        {
            if (paragraph.trim() != '')
            {
                const words = paragraph.split(' ');

                // Add links
                if (Math.random() > 0)
                {
                    const len = Math.round(2 + (Math.random() * 4));
                    const position = (len >= words.length) ? 0 : Math.round((words.length - len - 1) * Math.random());
                    words[position] =  '<a href="JavaScript:;">' + words[position];
                    words[position + len] = words[position + len] + '</a>';
                }
                result+= '<p>' + words.join(' ') + '</p>';
            }
        }

        // Go
        return Promise.resolve(result);
    }


    /**
     * @param {String} parameters
     * @returns {Promise}
     */
    includeMacro(parameters, site, useStaticContent)
    {
        return this.readPath(parameters, site, useStaticContent);
    }


    /**
     * @param {String} parameters
     * @returns {Promise}
     */
    imageMacro(parameters, site, useStaticContent)
    {
        const scope = this;
        const promise = co(function*()
        {
            const basePath = yield scope._pathesConfiguration.resolveData('/images');
            const files = yield glob(pathes.concat(basePath, parameters));
            if (!files || !files.length)
            {
                return parameters;
            }
            const index = (useStaticContent)
                ? 0
                : Math.round(Math.random() * (files.length - 1));
            return path.basename(files[index]);
        });
        return promise;
    }


    /**
     * Recursively scan data for macro calls (@macro:options)
     *
     * @param {*} value
     */
    process(data, site, useStaticContent)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Handle arrays
            if (Array.isArray(data))
            {
                const result = [];
                for (const item of data)
                {
                    const value = yield scope.process(item, site, useStaticContent);
                    result.push(value);
                }
                return result;
            }

            // Handle object literals
            if (isObject(data))
            {
                const keys = Object.keys(data);
                const result = {};
                for (const key of keys)
                {
                    const value = yield scope.process(data[key], site, useStaticContent);
                    result[key] = value;
                }
                return result;
            }

            // Handle macros
            if (isString(data))
            {
                //Is it a macro call?
                const macro = data.match(/^@([\w\-]+):(.*)$/i);
                if (macro)
                {
                    switch(macro[1].toLowerCase())
                    {
                        case 'lipsum':
                            return scope.lipsumMacro(macro[2] || '', site, useStaticContent);
                            break;

                        case 'lipsum-html':
                            return scope.lipsumHtmlMacro(macro[2] || '', site, useStaticContent);
                            break;

                        case 'include':
                        case 'import':
                            return scope.includeMacro(macro[2] || '', site, useStaticContent);
                            break;

                        case 'image':
                            return scope.imageMacro(macro[2] || '', site, useStaticContent);
                            break;
                    }
                }
            }

            // Everything else
            return data;
        });
        return promise;
    }


    /**
     * Resolves to a Object
     *
     * @param {String} path - The model path in the form of entity/modelName
     */
    readFile(filename, site, useStaticContent)
    {
        const scope = this;
        const promise = co(function*()
        {
            const rawData = JSON.parse(fs.readFileSync(filename, { encoding: 'utf8' }));
            randomIndex = 0;
            const data = yield scope.process(rawData, site, useStaticContent);
            return data;
        });
        return promise;
    }


    /**
     * Resolves to a Object
     *
     * @param {String} path - The model path in the form of entity/modelName
     * @param {model.site.Site} site - The site
     * @param {Boolean} useStaticContent - Should we use static or random contents?
     */
    readPath(path, site, useStaticContent)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Check straight path
            let filename = pathes.concat(scope._pathesConfiguration.sites, path);
            if (!filename.endsWith('.json'))
            {
                filename+= '.json';
            }
            if (fs.existsSync(filename))
            {
                return scope.readFile(filename, site, useStaticContent);
            }

            // Check entity short form (entityId:modelName)
            const pathParts = path.split('/');
            const entityId = pathParts[0] || '';
            const modelName = pathParts[1] || '';
            const entity = yield scope._entitiesRepository.getById(entityId, site);
            if (entity)
            {
                // Build a model path
                let modelPath = '/models/' + modelName;
                if (!modelPath.endsWith('.json'))
                {
                    modelPath+= '.json';
                }
                filename = yield scope._pathesConfiguration.resolveEntity(entity, modelPath);
                if (fs.existsSync(filename))
                {
                    return scope.readFile(filename, site, useStaticContent);
                }

                // Check extended parent
                if (entity.site.extends)
                {
                    const parentEntity = yield scope._entitiesRepository.getById(entityId, entity.site.extends);
                    filename = yield scope._pathesConfiguration.resolveEntity(parentEntity, modelPath);
                    if (fs.existsSync(filename))
                    {
                        return scope.readFile(filename, site, useStaticContent);
                    }
                }
            }

            return Promise.resolve(false);
        })
        .catch((e) =>
        {
            this.logger.error('readPath(' + path + ') : ', e);
        });
        return promise;
    }


    /**
     * Resolves to a ViewModel
     *
     * @param {String} path - The model path in the form of entity/modelName
     * @param {model.site.Site} site - The site context
     * @param {Boolean} useStaticContent - Should we use static or random contents?
     * @returns {Promise<ViewModel>}
     */
    getByPath(path, site, useStaticContent)
    {
        if (!path)
        {
            return Promise.resolve(false);
        }
        const scope = this;
        const promise = co(function*()
        {
            const data = yield scope.readPath(path, site, useStaticContent);
            return new ViewModel(data);
        })
        .catch((e) =>
        {
            this.logger.error('getByPath(' + path + ') : ', e);
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.ViewModelRepository = ViewModelRepository;
