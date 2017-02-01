// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var util = require('util');

exports = module.exports = StrongGlobalize;
exports.SetRootDir = noop;
exports.SetDefaultLanguage = noop;
exports.SetPersistentLogging = noop;

function StrongGlobalize() {
  if (!(this instanceof StrongGlobalize)) {
    return new StrongGlobalize();
  }
}

function noop() {}

StrongGlobalize.prototype.setLanguage = noop;

StrongGlobalize.prototype.getLanguage = function() {
  return 'en';
};

StrongGlobalize.prototype.c = function(value, currencySymbol, options) {
  return currencySymbol + ' ' + value.toString();
};
StrongGlobalize.prototype.formatCurrency = StrongGlobalize.prototype.c;

StrongGlobalize.prototype.d = function(value, options) {
  return value.toSyring();
};
StrongGlobalize.prototype.formatDate = StrongGlobalize.prototype.d;

StrongGlobalize.prototype.n = function(value, options) {
  return value.toString();
};
StrongGlobalize.prototype.formatNumber = StrongGlobalize.prototype.n;

StrongGlobalize.prototype.m = function(path, variables) {
  return util.format.apply(null, [path].concat(variables));
};
StrongGlobalize.prototype.formatMessage = StrongGlobalize.prototype.m;
StrongGlobalize.prototype.t = StrongGlobalize.prototype.m;

StrongGlobalize.prototype.Error = function() {
  return Error.apply(null, arguments);
};

StrongGlobalize.prototype.f = function() {
  return util.format.apply(null, arguments);
};
StrongGlobalize.prototype.format = StrongGlobalize.prototype.f;

StrongGlobalize.prototype.ewrite = function() {
  return process.stderr.apply(null, arguments);
};
StrongGlobalize.prototype.owrite = function() {
  return process.stdout.apply(null, arguments);
};
StrongGlobalize.prototype.write = StrongGlobalize.prototype.owrite;

function rfc5424(type, args, fn) {
  // Convert args from function arguments object to a regular array
  args = Array.prototype.slice.call(args);
  if (typeof args[0] === 'string') {
    // The first argument may contain formatting instructions like %s
    // which must be preserved.
    args[0] = type + ': ' + args[0];
  } else {
    args = [type, ': '].concat(args);
  }
  return fn.apply(console, args);
}
// RFC 5424 Syslog Message Severities
StrongGlobalize.prototype.emergency = function() {
  return rfc5424('emergency', arguments, console.error);
};
StrongGlobalize.prototype.alert = function() {
  return rfc5424('alert', arguments, console.error);
};
StrongGlobalize.prototype.critical = function() {
  return rfc5424('critical', arguments, console.error);
};
StrongGlobalize.prototype.error = function() {
  return rfc5424('error', arguments, console.error);
};
StrongGlobalize.prototype.warning = function() {
  return rfc5424('warning', arguments, console.warn);
};
StrongGlobalize.prototype.notice = function() {
  return rfc5424('notice', arguments, console.log);
};
StrongGlobalize.prototype.informational = function() {
  return rfc5424('informational', arguments, console.log);
};
StrongGlobalize.prototype.debug = function() {
  return rfc5424('debug', arguments, console.log);
};

// Node.js console
StrongGlobalize.prototype.warn = function() {
  return rfc5424('warn', arguments, console.warn);
};
StrongGlobalize.prototype.info = function() {
  return rfc5424('info', arguments, console.log);
};
StrongGlobalize.prototype.log = function() {
  return rfc5424('log', arguments, console.log);
};

// Misc Logging Levels
StrongGlobalize.prototype.help = function() {
  return rfc5424('help', arguments, console.log);
};
StrongGlobalize.prototype.data = function() {
  return rfc5424('data', arguments, console.log);
};
StrongGlobalize.prototype.prompt = function() {
  return rfc5424('prompt', arguments, console.log);
};
StrongGlobalize.prototype.verbose = function() {
  return rfc5424('verbose', arguments, console.log);
};
StrongGlobalize.prototype.input = function() {
  return rfc5424('input', arguments, console.log);
};
StrongGlobalize.prototype.silly = function() {
  return rfc5424('silly', arguments, console.log);
};
