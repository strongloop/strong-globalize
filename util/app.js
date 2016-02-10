var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var util = require('util');
var zlib = require('zlib');

var LANGS = [
  'en', 'de', 'es', 'fr', 'it', 'pt', 'ru',
  'ja', 'ko', 'zh-Hans', 'zh-Hant',
];

var cldrVersion = require(path.resolve(__dirname,
  'node_modules', 'cldr-data', 'package.json')).version;
var cldrRevision = null;
var CLDR = {};

LANGS.forEach(function(lang) {
  loadCldr(lang);
});

cldrRevision = CLDR.main.en.identity.version._number.replace(
  /^\$Revision: ([0-9]+) \$$/, '$1');
var CLDR_FILE = path.join(__dirname, 'cldr_' + cldrVersion
  + '_' + cldrRevision);
var CLDR_FILE_GZ = CLDR_FILE + '.gz';

fs.writeFileSync(CLDR_FILE, JSON.stringify(CLDR, null, 2));
var zipped = zlib.gzipSync(
  JSON.stringify(CLDR), {data_type: zlib.Z_TEXT});
fs.writeFileSync(CLDR_FILE_GZ, zipped);

function loadCldr(lang) {
  var mainPath = path.join('cldr-data', 'main', '%s');
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
