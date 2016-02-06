'use strict';

var Globalize = require('globalize');
var assert = require('assert');
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var helper = require('./helper');
var osLocale = require('os-locale');
var md5 = require('md5');
var path = require('path');
var translate = require('./translate');
var util = require('util');
var zlib = require('zlib');

exports.setDefaultLanguage = setDefaultLanguage;
exports.setRootDir = helper.setRootDir;
exports.setPersistentLogging = helper.setPersistentLogging;

exports.formatCurrency = exports.c = formatCurrency;
exports.formatDate = exports.d = formatDate;
exports.formatNumber = exports.n = formatNumber;
exports.formatMessage = exports.t = exports.m = formatMessage;

exports.Error = myError;
exports.format = exports.f = format;
exports.ewrite = ewrite;
exports.owrite = exports.write = owrite;

// RFC 5424 Syslog Message Severities
exports.emergency = emergency;
exports.alert = alert;
exports.critical = critical;
exports.error = error;
exports.warning = warning;
exports.notice = notice;
exports.informational = informational;
exports.debug = myDebug;

// Node.js console
exports.warn = warn;
exports.info = info;
exports.log = log;

// Misc Logging Levels
exports.help = help;
exports.data = data;
exports.prompt = prompt;
exports.verbose = verbose;
exports.input = input;
exports.silly = silly;

var CLDR_VERSION = 'cldr_28.0.3_11972';

/**
 * StrongLoop Defaults
 */

var SL_DEFAULT_DATETIME = {datetime: 'medium'};
var SL_DEFAULT_NUMBER = {round: 'floor'};
var SL_DEFAULT_CURRENCY = {style: 'name'};

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
  global.STRONGLOOP_GLB.locale(lang);
  global.STRONGLOOP_GLB.DEFAULT_LANG = lang;
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
  var lang = global.STRONGLOOP_GLB.DEFAULT_LANG;
  debug('DEFAULT_LANG =', lang, __filename);
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
      message = sanitizeMsg(message, variables);
    };
  }
  return message;
}

function sanitizeMsg(message, variables) {
  if (typeof variables === 'string' ||
      (Array.isArray(variables) && variables.length > 0)) {
    var sanitizedMsg = message
      .replace(/}}/g, '')
      .replace(/{{/g, '')
      .replace(/%[sdj]/g, '%s');
    message = util.format.apply(util, [sanitizedMsg].concat(variables));
  }
  return message;
}

function packMessage(args, fn, withOriginalMsg) {
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
  if (withOriginalMsg) message = {
    message: message,
    orig: path,
    vars: variables,
  };
  if (fn) return fn(message);
  return message;
}

/* RFC 5424 Syslog Message Severities
 * 0 Emergency: system is unusable
 * 1 Alert: action must be taken immediately
 * 2 Critical: critical conditions
 * 3 Error: error conditions
 * 4 Warning: warning conditions
 * 5 Notice: normal but significant condition
 * 6 Informational: informational messages
 * 7 Debug: debug-level messages
 */

function rfc5424(level, args, console) {
  return packMessage(args, function(msg) {
    helper.logPersistent(msg, level);
    if (helper.consoleEnabled()) console(msg.message);
  }, true);
}

function emergency() { return rfc5424('emergency', arguments, console.error); }
function alert() { return rfc5424('alert', arguments, console.error); }
function critical() { return rfc5424('critical', arguments, console.error); }
function error() { return rfc5424('error', arguments, console.error); }
function warning() { return rfc5424('warning', arguments, console.error); }
function notice() { return rfc5424('notice', arguments, console.log); }
function informational() {
  return rfc5424('informational', arguments, console.log);
}
function myDebug() { return rfc5424('debug', arguments, console.log); }

function warn() { return rfc5424('warn', arguments, console.error); }
function info() { return rfc5424('info', arguments, console.log); }
function log() { return rfc5424('log', arguments, console.log); }

function help() { return rfc5424('help', arguments, console.log); }
function data() { return rfc5424('data', arguments, console.log); }
function prompt() { return rfc5424('prompt', arguments, console.log); }
function verbose() { return rfc5424('verbose', arguments, console.log); }
function input() { return rfc5424('input', arguments, console.log); }
function silly() { return rfc5424('prompt', arguments, console.log); }

function myError() {
  return packMessage(arguments, Error);
}

function ewrite() {
  return packMessage(arguments, function(msg) {
    helper.logPersistent(msg, 'error');
    if (helper.consoleEnabled()) process.stderr.write(msg.message);
  }, true);
}

function owrite() {
  return packMessage(arguments, function(msg) {
    helper.logPersistent(msg, 'info');
    if (helper.consoleEnabled()) process.stdout.write(msg.message);
  }, true);
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
  var lang = global.STRONGLOOP_GLB.DEFAULT_LANG;
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
  var lang = global.STRONGLOOP_GLB.DEFAULT_LANG;
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
  var lang = global.STRONGLOOP_GLB.DEFAULT_LANG;
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
    global.STRONGLOOP_GLB = {
      bundles: {},
      load: Globalize.load,
      locale: Globalize.locale,
      loadMessages: Globalize.loadMessages,
      DEFAULT_LANG: helper.ENGLISH,
    };
    loadCldr(helper.ENGLISH);
    global.STRONGLOOP_GLB.bundles[helper.ENGLISH] =
      new Globalize(helper.ENGLISH);
    global.STRONGLOOP_GLB.locale(helper.ENGLISH);
    translate.loadMsgFromFile(helper.ENGLISH);
  };
  if (!(lang in global.STRONGLOOP_GLB.bundles)) {
    loadCldr(lang);
    global.STRONGLOOP_GLB.bundles[lang] = new Globalize(lang);
    global.STRONGLOOP_GLB.locale(lang);
    translate.loadMsgFromFile(lang);
  }
  return global.STRONGLOOP_GLB.bundles[lang];
}

function loadCldr(lang) {
  assert(global.STRONGLOOP_GLB && (!global.STRONGLOOP_GLB.bundles ||
    !global.STRONGLOOP_GLB.bundles[lang]), 'CLDR already loaded for ' + lang);
  var cldrFile = path.join(__dirname, '..', 'cldr',
    CLDR_VERSION.toString() + '.gz');
  var cldr = JSON.parse(zlib.gunzipSync(fs.readFileSync(cldrFile)));
  var cldrMain = {main: {}};
  cldrMain.main[lang] = cldr.main[lang];
  global.STRONGLOOP_GLB.load(cldrMain);
  if (lang === helper.ENGLISH) {
    var cldrSupplemental = {supplemental: cldr.supplemental};
    global.STRONGLOOP_GLB.load(cldrSupplemental);
  }
}
