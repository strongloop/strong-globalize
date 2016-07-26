// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var _ = require('lodash');
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var path = require('path');
var util = require('util');

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
  // 'af', // Afrikaans
  // 'am', // Amharic
  // 'ar', // Araic
  // 'az', // Azerbaijani
  // 'be', // Belarusian
  // 'bg', // Bulgarian
  // 'bn', // Bengali, Bangla
  // 'bs', // Bosnian
  // 'ca', // Catalan
  // 'cs', // Czech
  // 'cy', // Welsh
  // 'da', // Danish
  // 'el', // Greek
  // 'et', // Estonian
  // 'eu', // Basque
  // 'fa', // Persian
  // 'fi', // Finnish
  // 'fil', // Pilipino
  // 'fo', // Faroese
  // 'ga', // Irish
  // 'gl', // Galician
  // 'gu', // Gujarati
  // 'he', // Hebrew
  // 'hi', // Hindi
  // 'hr', // Croatian
  // 'hu', // Hungarian
  // 'hy', // Armenian
  // 'id', // Indonesian
  // 'is', // Icelandic
  // 'ka', // Georgian
  // 'kk', // Kazakh
  // 'km', // Khmer
  // 'kn', // Kannada
  // 'ky', // Kyrgyz
  // 'lo', // Lao
  // 'lt', // Lithuanian
  // 'lv', // Latvian
  // 'mk', // Macedonian
  // 'ml', // Malayalam
  // 'mn', // Mongolian
  // 'mr', // Marathi (Marāṭhī)
  // 'ms', // Malay
  // 'my', // Burmese
  // 'nb', // Norwegian Bokmål
  // 'ne', // Nepali
  // 'nl', // Dutch
  // 'pa', // Panjabi, Punjabi
  // 'pl', // Polish
  // 'ro', // Romanian
  // 'si', // Sinhalese, Sinhala
  // 'sk', // Slovak
  // 'sl', // Slovene
  // 'sq', // Albanian
  // 'sr', // Serbian
  // 'sv', // Swedish
  // 'sw', // Swahili
  // 'ta', // Tamil
  // 'te', // Telugu
  // 'th', // Thai
  // 'to', // Tonga (Tonga Islands)
  // 'tr', // Turkish
  // 'uk', // Ukrainian
  // 'ur', // Urdu
  // 'uz', // Uzbek
  // 'vi', // Vietnamese
  // 'zu', // Zulu
];

var cldrVersion = require(path.resolve(__dirname,
  'node_modules', 'cldr-data', 'package.json')).version;
var CLDR = {};

LANGS.forEach(function(lang) {
  loadCldr(lang);
});

var CLDR_FILE = path.join(__dirname, 'cldr_' + cldrVersion);
fs.writeFileSync(CLDR_FILE, JSON.stringify(CLDR, null, 2));

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
