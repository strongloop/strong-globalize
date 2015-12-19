'use strict';

var Globalize = require('globalize');
var assert = require('assert');
var debug = require('debug')('strong-globalize');
var helper = require('./helper');
var osLocale = require('os-locale');
var md5 = require('md5');
var path = require('path');
var translate = require('./translate');
var util = require('util');

exports.setDefaultLanguage = setDefaultLanguage;
exports.setRootDir = helper.setRootDir;
exports.formatCurrency = exports.c = formatCurrency;
exports.formatDate = exports.d = formatDate;
exports.formatNumber = exports.n = formatNumber;
exports.formatMessage = exports.t = formatMessage;
exports.Error = myError;
exports.error = error;
exports.format = format;
exports.log = log;
exports.owrite = exports.write = owrite;
exports.ewrite = ewrite;

/**
 * StrongLoop Defaults
 */

var SL_DEFAULT_DATETIME = {datetime: 'medium'};
var SL_DEFAULT_NUMBER = {round: 'floor'};
var SL_DEFAULT_CURRENCY = {style: 'name'};

var DEFAULT_LANG = helper.ENGLISH;
var OS_LANG = osLanguage();
var MY_APP_LANG = process.env.STRONGLOOP_GLOBALIZE_APP_LANGUAGE;
MY_APP_LANG = helper.isSupportedLanguage(MY_APP_LANG) ? MY_APP_LANG : null;

function osLanguage() {
  var locale = osLocale.sync();
  var lang = locale.substring(0, 2);
  if (helper.isSupportedLanguage(lang)) return lang;
  if (lang === 'zh') {
    var region = locale.substring(3);
    if (region === 'CN') return 'zh-Hans';
    if (region === 'TW') return 'zh-Hant';
    if (region === 'Hans') return 'zh-Hans';
    if (region === 'Hant') return 'zh-Hant';
  }
  return null;
}

/**
 * setDefaultLanguage
 *
 * @param {string} (optional, default: `'en'`) Language ID.
 *     It tries to use OS language, then falls back to 'en'
 */
function setDefaultLanguage(lang) {
  lang = helper.isSupportedLanguage(lang) ? lang : null;
  lang = lang || MY_APP_LANG || OS_LANG || helper.ENGLISH;
  loadGlobalize(lang);
  if (lang !== helper.ENGLISH) loadGlobalize(helper.ENGLISH);
  Globalize.locale(lang);
  DEFAULT_LANG = lang;
  return lang;
}

/**
 * Globalize.formatMessage wrapper returns a string.
 *
 * @param {string} path The message key
 * @param {object} variables List of placeholder key and content value pair.
 * @param {string} variables.<phXXX> The placeholder key.
 * @param {string} variables.<string> The content value.
 *     If the system locale is undefined, falls back to 'en'
 */
function formatMessage(path, variables) {
  assert(path);
  var message = path.slice(0);
  if (helper.hashKeys(path)) path = md5(path);
  if (!global.STRONGLOOP_GLB) setDefaultLanguage();
  var lang = DEFAULT_LANG;
  var g = null;
  try {
    g = global.STRONGLOOP_GLB.bundles[lang];
    message = g.messageFormatter(path)(variables || {});
  } catch (e) {
    debug(
      '*** %s for %s not localized.  Fall back to English. ***',
      path, lang
    );
    g = global.STRONGLOOP_GLB.bundles[helper.ENGLISH];
    try {
      message = g.messageFormatter(path)(variables || {});
    } catch (e) {
      debug(
        '*** %s not found for %s.  Fall back to: "%s" ***',
        path, lang, message
      );
    };
  }
  return message;
}

function packMessage(args, fn) {
  var path = args[0];
  var percentInKey = helper.percent(path);
  var txtWithTwoOrMoreArgs =
    (helper.getTrailerAfterDot(path) === 'txt' && args.length > 2);
  // If it comes from *.txt, there are no percent in the path,
  // but there can be one or more %s in the message value.
  var variables = percentInKey ? helper.mapArgs(path, args) :
    txtWithTwoOrMoreArgs ? helper.repackArgs(args, 1) : args[1];
  debug('packMessage:', path, JSON.stringify(args, null, 2), variables);
  var message = formatMessage(path, variables);
  if (fn === process.stderr.write) return process.stderr.write(message);
  if (fn === process.stdout.write) return process.stdout.write(message);
  if (fn) return fn(message);
  return message;
}

function myError() {
  return packMessage(arguments, Error);
}

function error() {
  return packMessage(arguments, console.error);
}

function log() {
  return packMessage(arguments, console.log);
}

function ewrite() {
  return packMessage(arguments, process.stderr.write);
}

function owrite() {
  return packMessage(arguments, process.stdout.write);
}

function format() {
  return packMessage(arguments);
}

/**
 * Globalize.formatNumber wrapper returns a string.
 *
 * @param {value} integer or float
 * @param {object} The options (optional); if null, use the StrongLoop default.
 *     Strongly recommended to set NO options and let strong-globalize use
 *     the StrongLoop default for consistency across StrongLoop products.
 *     See https://www.npmjs.com/package/globalize#number-module
 */
function formatNumber(value, options) {
  if (!global.STRONGLOOP_GLB) setDefaultLanguage();
  var lang = DEFAULT_LANG;
  options = options || SL_DEFAULT_NUMBER;
  var G = global.STRONGLOOP_GLB.bundles[lang];
  var msg = null;
  try {
    msg = G.formatNumber(value, options);
  } catch (e) {
    msg = value.toString();
    debug('*** formatNumber error: value:%s', msg);
  }
  return msg;
}

/**
 * Globalize.formatDate wrapper returns a string.
 *
 * @param {Date object} such as new Date()
 * @param {object} The options (optional); if null, use the StrongLoop default.
 *     Strongly recommended to set NO options and let strong-globalize use
 *     the StrongLoop default for consistency across StrongLoop products.
 *     See https://www.npmjs.com/package/globalize#date-module
 */
function formatDate(value, options) {
  assert(value);
  if (!global.STRONGLOOP_GLB) setDefaultLanguage();
  var lang = DEFAULT_LANG;
  options = options || SL_DEFAULT_DATETIME;
  var G = global.STRONGLOOP_GLB.bundles[lang];
  var msg = null;
  try {
    msg = G.formatDate(value, options);
  } catch (e) {
    msg = value.toString();
    debug('*** formatDate error: value:%s', msg);
  }
  return msg;
}

/**
 * Globalize.formatCurrency wrapper returns a string.
 *
 * @param {value} integer or float
 * @param {string} three-letter currency symbol, ISO 4217 Currency Code
 * @param {object} The options (optional); if null, use the StrongLoop default.
 *     Strongly recommended to set NO options and let strong-globalize use
 *     the StrongLoop default for consistency across StrongLoop products.
 *     See https://www.npmjs.com/package/globalize#curency-module
 */
function formatCurrency(value, currencySymbol, options) {
  assert(value && currencySymbol);
  if (!global.STRONGLOOP_GLB) setDefaultLanguage();
  var lang = DEFAULT_LANG;
  options = options || SL_DEFAULT_CURRENCY;
  var G = global.STRONGLOOP_GLB.bundles[lang];
  var msg = null;
  try {
    msg = G.formatCurrency(value, currencySymbol, options);
  } catch (e) {
    msg = value.toString();
    debug('*** formatCurrency error: value:%s, currencySymbol:%s',
      msg, currencySymbol);
  }
  return msg;
}

function loadGlobalize(lang) {
  assert(helper.isSupportedLanguage(lang), 'Not supported: ' + lang);
  if (!global.STRONGLOOP_GLB) {
    loadCldr(helper.ENGLISH);
    global.STRONGLOOP_GLB = {
      bundles: {},
    };
    global.STRONGLOOP_GLB.bundles[helper.ENGLISH] =
      new Globalize(helper.ENGLISH);
    Globalize.locale(helper.ENGLISH);
    translate.loadMsgFromFile(helper.ENGLISH);
  };
  if (!(lang in global.STRONGLOOP_GLB.bundles)) {
    loadCldr(lang);
    global.STRONGLOOP_GLB.bundles[lang] = new Globalize(lang);
    Globalize.locale(lang);
    translate.loadMsgFromFile(lang);
  }
  return global.STRONGLOOP_GLB.bundles[lang];
}

function loadCldr(lang) {
  assert(!global.STRONGLOOP_GLB || !global.STRONGLOOP_GLB.bundles ||
    !global.STRONGLOOP_GLB.bundles[lang],
        'CLDR already loaded for ' + lang);
  var mainPath = path.join('cldr-data', 'main', '%s');
  var bundleCa = path.join(mainPath, 'ca-gregorian');
  var bundleCurrencies = path.join(mainPath, 'currencies');
  var bundleDates = path.join(mainPath, 'dateFields');
  var bundleNumbers = path.join(mainPath, 'numbers');
  Globalize.load(
    require(util.format(bundleCa, lang)),
    require(util.format(bundleCurrencies, lang)),
    require(util.format(bundleDates, lang)),
    require(util.format(bundleNumbers, lang))
  );
  if (lang === helper.ENGLISH) {
    var supplementalPath = path.join('cldr-data', 'supplemental');
    Globalize.load(
      require(path.join(supplementalPath, 'likelySubtags')),
      require(path.join(supplementalPath, 'plurals')),
      // require(path.join(supplementalPath, 'timeData')),
      // require(path.join(supplementalPath, 'weekData')),
      require(path.join(supplementalPath, 'currencyData'))
    );
  };
}
