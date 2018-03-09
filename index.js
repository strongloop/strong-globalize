// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

// Single-instance strong-globalize
// module.exports = require('./lib/globalize');


// Multi-instance strong-globalize
var globalize = require('./lib/globalize');
var helper = require('./lib/helper');
var path = require('path');
var translate = require('./lib/translate');
var xtend = require('xtend');

exports = module.exports = StrongGlobalize;
exports.SetRootDir = SetRootDir;
exports.SetDefaultLanguage = globalize.setDefaultLanguage;
exports.SetAppLanguages = globalize.setAppLanguages;
exports.SetPersistentLogging = globalize.setPersistentLogging;

/**
 * FIXME: workaround for
 * https://github.com/strongloop/strong-globalize/issues/127
 *
 * Monkey-patching Cldr.prototype.get for `zz`
 * See:
 * https://github.com/rxaviers/cldrjs/blob/master/src/core/likely_subtags.js#L75
 */
try {
  const Cldr = require('cldrjs');
  const get = Cldr.prototype.get;
  Cldr.prototype.get = function(path) {
    if (Array.isArray(path)) {
      path = path.map(function(p) {
        return p === 'zz' ? 'en' : p;
      });
    }
    return get.call(this, path);
  };
} catch (e) {
  // Ignore
}

function StrongGlobalize(options) {
  if (!(this instanceof StrongGlobalize)) {
    return new StrongGlobalize(options);
  }
  if (typeof options === 'string') {
    exports.SetRootDir(options);
    options = undefined;
  }
  if (!global.STRONGLOOP_GLB) {
    globalize.setDefaultLanguage();
    globalize.setAppLanguages();
  }

  var defaults = {
    language: global.STRONGLOOP_GLB.DEFAULT_LANG,
    appLanguages: global.STRONGLOOP_GLB.APP_LANGS,
  };

  this._options = options ? xtend(defaults, options) : defaults;
}

function SetRootDir(rootDir, options) {
  var defaults = {
    autonomousMsgLoading: helper.AML_DEFAULT,
  };
  options = options ? xtend(defaults, options) : defaults;
  options.autonomousMsgLoading =
    helper.validateAmlValue(options.autonomousMsgLoading);
  if (!options.autonomousMsgLoading) {
    options.autonomousMsgLoading = defaults.autonomousMsgLoading;
  }
  globalize.setRootDir(rootDir);
  if (!global.STRONGLOOP_GLB) {
    globalize.setDefaultLanguage();
    global.STRONGLOOP_GLB.AUTO_MSG_LOADING = options.autonomousMsgLoading;
  }
  if (path.resolve(rootDir) !==
      path.resolve(global.STRONGLOOP_GLB.MASTER_ROOT_DIR) &&
      helper.isLoadMessages(rootDir)) {
    var langs = Object.keys(global.STRONGLOOP_GLB.bundles);
    langs.forEach(function(lang) {
      translate.loadMsgFromFile(lang, rootDir);
    });
  }
}

StrongGlobalize.prototype.setLanguage = function(lang) {
  lang = helper.isSupportedLanguage(lang) ?
    lang : global.STRONGLOOP_GLB.DEFAULT_LANG;
  this._options.language = lang;
};

StrongGlobalize.prototype.getLanguage = function() {
  return this._options.language;
};

StrongGlobalize.prototype.c = function(value, currencySymbol, options) {
  globalize.loadGlobalize(this._options.language);
  return globalize.formatCurrency(value, currencySymbol, options,
    this._options.language);
};
StrongGlobalize.prototype.formatCurrency = StrongGlobalize.prototype.c;

StrongGlobalize.prototype.d = function(value, options) {
  globalize.loadGlobalize(this._options.language);
  return globalize.formatDate(value, options, this._options.language);
};
StrongGlobalize.prototype.formatDate = StrongGlobalize.prototype.d;

StrongGlobalize.prototype.n = function(value, options) {
  globalize.loadGlobalize(this._options.language);
  return globalize.formatNumber(value, options, this._options.language);
};
StrongGlobalize.prototype.formatNumber = StrongGlobalize.prototype.n;

StrongGlobalize.prototype.m = function(path, variables) {
  globalize.loadGlobalize(this._options.language);
  return globalize.formatMessage(path, variables, this._options.language);
};
StrongGlobalize.prototype.formatMessage = StrongGlobalize.prototype.m;
StrongGlobalize.prototype.t = StrongGlobalize.prototype.m;

StrongGlobalize.prototype.Error = function() {
  globalize.loadGlobalize(this._options.language);
  var msg = globalize.packMessage(arguments, null, true,
    this._options.language);
  globalize.logPersistent('error', msg);
  return Error(msg.message);
};

StrongGlobalize.prototype.f = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.packMessage(arguments, null,
    false, this._options.language);
};
StrongGlobalize.prototype.format = StrongGlobalize.prototype.f;

StrongGlobalize.prototype.ewrite = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.packMessage(arguments, function(msg) {
    globalize.logPersistent(msg, 'error');
    if (globalize.consoleEnabled()) process.stderr.write(msg.message);
  }, true, this._options.language);
};
StrongGlobalize.prototype.owrite = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.packMessage(arguments, function(msg) {
    globalize.logPersistent(msg, 'error');
    if (globalize.consoleEnabled()) process.stdout.write(msg.message);
  }, true, this._options.language);
};
StrongGlobalize.prototype.write = StrongGlobalize.prototype.owrite;

// RFC 5424 Syslog Message Severities
StrongGlobalize.prototype.emergency = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('emergency', arguments, console.error,
    this._options.language);
};
StrongGlobalize.prototype.alert = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('alert', arguments, console.error,
    this._options.language);
};
StrongGlobalize.prototype.critical = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('critical', arguments, console.error,
    this._options.language);
};
StrongGlobalize.prototype.error = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('error', arguments, console.error,
    this._options.language);
};
StrongGlobalize.prototype.warning = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('warning', arguments, console.error,
    this._options.language);
};
StrongGlobalize.prototype.notice = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('notice', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.informational = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('informational', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.debug = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('debug', arguments, console.log,
    this._options.language);
};

// Node.js console
StrongGlobalize.prototype.warn = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('warn', arguments, console.error,
    this._options.language);
};
StrongGlobalize.prototype.info = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('info', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.log = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('log', arguments, console.log,
    this._options.language);
};

// Misc Logging Levels
StrongGlobalize.prototype.help = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('help', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.data = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('data', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.prompt = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('prompt', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.verbose = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('verbose', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.input = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('input', arguments, console.log,
    this._options.language);
};
StrongGlobalize.prototype.silly = function() {
  globalize.loadGlobalize(this._options.language);
  return globalize.rfc5424('silly', arguments, console.log,
    this._options.language);
};

/**
 * This function is useful for applications (e.g. express)
 * that have an HTTP Request object with headers.
 *
 * You can pass the request object, and it will negotiate
 * the best matching language to globalize the message.
 *
 * The matching algorithm is done against the languages
 * supported by the application. (those included in the intl dir)
 *
 * @param req
 * @returns {*}
 */
var sgCache = new Map(); /* eslint-env es6 */
StrongGlobalize.prototype.http = function(req) {

  var matchingLang = helper.getLanguageFromRequest(req,
    this._options.appLanguages,
    this._options.language);

  var sg = sgCache.get(matchingLang);
  if (sg) {
    return sg;
  }

  sg = new StrongGlobalize(this._options);
  sg.setLanguage(matchingLang);
  sgCache.set(matchingLang, sg);
  return sg;
};
