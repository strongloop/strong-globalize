var _ = require('lodash');
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var path = require('path');
var util = require('util');
var zlib = require('zlib');
try {
  var nodeVersion = process.version.replace(
    /(^v[0-9]+\.[0-9]+)\.[0-9]+$/, '$1');
  if (nodeVersion === 'v0.10') {
    zlib = require('node-zlib-backport');
    debug('Zlib backported on %s', process.version);
  }
} catch (e) {
  debug('Zlib backport failed on %s', process.version);
}

var LANGS = [
  'en', // English
  'de', // German
  'es', // Spanish
  'fr', // French
  'it', // Italian
  'pt', // Portuguese
  'ru', // Russian
  'ja', // Japanese
  'ko', // Korean
  'zh-Hans', // Chinese (Simplified)
  'zh-Hant', // Chinese (traditional)
  // 'ar', // Araic
  // 'cs', // Czech
  // 'da', // Danish
  // 'nl', // Dutch
  // 'fi', // Finnish
  // 'el', // Greek
  // 'he', // Hebrew
  // 'hi', // Hindi
  // 'lo', // Lao
  // 'it', // Lithuanian
  // 'ms', // Malay
  // 'nb', // Norwegian Bokmål
  // 'fa', // Persian
  // 'pl', // Polish
  // 'ro', // Romanian
  // 'sv', // Swedish
  // 'th', // Thai
  // 'vi', // Vietnamese
];

var cldrVersion = require(path.resolve(__dirname,
  'node_modules', 'cldr-data', 'package.json')).version;
var CLDR = {};

LANGS.forEach(function(lang) {
  loadCldr(lang);
});

var CLDR_FILE = path.join(__dirname, 'cldr_' + cldrVersion);
var CLDR_FILE_GZ = CLDR_FILE + '.gz';

fs.writeFileSync(CLDR_FILE, JSON.stringify(CLDR, null, 2));
var zipped = zlib.gzipSync(
  JSON.stringify(CLDR), {data_type: zlib.Z_TEXT});
fs.writeFileSync(CLDR_FILE_GZ, zipped);

function loadCldr(lang) {
  var mainPath = path.join(__dirname, 'node_modules',
    'cldr-data', 'main', '%s');
  var bundleCa = path.join(mainPath, 'ca-gregorian');
  var bundleCurrencies = path.join(mainPath, 'currencies');
  var bundleDates = path.join(mainPath, 'dateFields');
  var bundleNumbers = path.join(mainPath, 'numbers');

  CLDR = _.merge(CLDR, require(util.format(bundleCa, lang)));
  CLDR = _.merge(CLDR, require(util.format(bundleCurrencies, lang)));
  CLDR = _.merge(CLDR, require(util.format(bundleDates, lang)));
  CLDR = _.merge(CLDR, require(util.format(bundleNumbers, lang)));

  if (lang === 'en') {
    var supplementalPath = path.join('cldr-data', 'supplemental');
    var likelySubtags = require(path.join(supplementalPath, 'likelySubtags'));
    CLDR = _.merge(CLDR, likelySubtags);
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'plurals')));
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'timeData')));
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'weekData')));
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'currencyData')));
  }
}
