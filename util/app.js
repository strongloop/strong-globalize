// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var _ = require('lodash');
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
  'ar', // Arabic
  'bn', // Bengali, Bangla
  'cs', // Czech
  'el', // Greek
  'fi', // Finnish
  'hi', // Hindi
  'id', // Indonesian
  'lt', // Lithuanian
  'nb', // Norwegian Bokmål
  'nl', // Dutch
  'pl', // Polish
  'ro', // Romanian
  'sl', // Slovene
  'sv', // Swedish
  'ta', // Tamil
  'te', // Telugu
  'th', // Thai
  'tr', // Turkish
  'uk', // Ukrainian
  'vi', // Vietnamese
  // 'af', // Afrikaans
  // 'am', // Amharic
  // 'az', // Azerbaijani
  // 'be', // Belarusian
  // 'bg', // Bulgarian
  // 'bs', // Bosnian
  // 'ca', // Catalan
  // 'cy', // Welsh
  // 'da', // Danish
  // 'et', // Estonian
  // 'eu', // Basque
  // 'fa', // Persian
  // 'fil', // Philippino
  // 'fo', // Faroese
  // 'ga', // Irish
  // 'gl', // Galician
  // 'gu', // Gujarati
  // 'he', // Hebrew
  // 'hr', // Croatian
  // 'hu', // Hungarian
  // 'hy', // Armenian
  // 'is', // Icelandic
  // 'ka', // Georgian
  // 'kk', // Kazakh
  // 'km', // Khmer
  // 'kn', // Kannada
  // 'ky', // Kyrgyz
  // 'lo', // Lao
  // 'lv', // Latvian
  // 'mk', // Macedonian
  // 'ml', // Malayalam
  // 'mn', // Mongolian
  // 'mr', // Marathi (Marāṭhī)
  // 'ms', // Malay
  // 'my', // Burmese
  // 'ne', // Nepali
  // 'pa', // Panjabi, Punjabi
  // 'si', // Sinhalese, Sinhala
  // 'sk', // Slovak
  // 'sq', // Albanian
  // 'sr', // Serbian
  // 'sw', // Swahili
  // 'to', // Tonga (Tonga Islands)
  // 'ur', // Urdu
  // 'uz', // Uzbek
  // 'zu', // Zulu
];

var cldrVersion = require(path.resolve(__dirname,
  'node_modules', 'cldr-data', 'package.json')).version;
var CLDR = {};

LANGS.forEach(function(lang) {
  loadCldr(lang);
});

var CLDR_FILE = path.join(__dirname, 'cldr_' + cldrVersion + '.json');
fs.writeFileSync(CLDR_FILE, JSON.stringify(CLDR));

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
