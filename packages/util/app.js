// Copyright Tetsuo Seto 2018,2020. All Rights Reserved.
// Node module: strong-globalize-util

'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require('util');

const LANGS = [
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

const cldrVersion = require(path.resolve(
  __dirname,
  'node_modules/cldr-data/package.json'
)).version;
var CLDR = {};

LANGS.forEach(function(lang) {
  loadCldr(lang);
});

const CLDR_FILE = path.join(__dirname, 'cldr_' + cldrVersion + '.json');
fs.writeFileSync(CLDR_FILE, JSON.stringify(CLDR));
console.log('CLDR updated: %s', CLDR_FILE);

function loadCldr(lang) {
  const mainPath = path.join(__dirname, 'node_modules/cldr-data/main/%s');
  const bundleCa = path.join(mainPath, 'ca-gregorian');
  const bundleCurrencies = path.join(mainPath, 'currencies');
  const bundleDates = path.join(mainPath, 'dateFields');
  const bundleNumbers = path.join(mainPath, 'numbers');

  CLDR = _.merge(CLDR, require(util.format(bundleCa, lang)));
  CLDR = _.merge(CLDR, require(util.format(bundleCurrencies, lang)));
  CLDR = _.merge(CLDR, require(util.format(bundleDates, lang)));
  CLDR = _.merge(CLDR, require(util.format(bundleNumbers, lang)));

  if (lang === 'en') {
    const supplementalPath = path.join('cldr-data', 'supplemental');
    const likelySubtags = require(path.join(supplementalPath, 'likelySubtags'));
    CLDR = _.merge(CLDR, likelySubtags);
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'plurals')));
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'timeData')));
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'weekData')));
    CLDR = _.merge(CLDR, require(path.join(supplementalPath, 'currencyData')));
  }
}
